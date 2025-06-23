import { ICommonCropOptions, ICropOpts } from '../index';
import { ParsedFrame } from 'gifuct-js';
import type { IParsedFrameInfo } from './decoder';

export interface IFrameCropperProps {
  commonCropOptions: ICommonCropOptions;
}

export class FrameCropper {
  private frames!: ImageData[];
  private parsedFrames!: ParsedFrame[];
  private commonCropOptions!: ICommonCropOptions;
  private convertorCanvas!: HTMLCanvasElement;
  private containerCanvas!: HTMLCanvasElement;
  private convertCtx!: CanvasRenderingContext2D;
  private containerCtx!: CanvasRenderingContext2D;
  private cropperJsOpts!: Required<ICropOpts>;
  private offsetX = 0;
  private offsetY = 0;
  private containerCenterX = 0;
  private containerCenterY = 0;
  private resultFrames: ImageData[] = [];
  constructor(props: IFrameCropperProps) {
    this.init(props);
  }

  public init({ commonCropOptions }: IFrameCropperProps) {
    this.commonCropOptions = commonCropOptions;
    this.cropperJsOpts = commonCropOptions.cropperJsOpts;
    // 重置状态
    this.resultFrames = [];
    if (!this.containerCanvas || !this.convertorCanvas) {
      this.setupCanvas();
    }
    this.setCanvasWH();
  }

  public async cropGif(parsedFrameInfo: IParsedFrameInfo) {
    const { frames, parsedFrames } = parsedFrameInfo;
    this.frames = frames;
    this.parsedFrames = parsedFrames;
    let frameIdx = 0;
    while (frameIdx < this.frames.length) {
      const currentFrame = this.frames[frameIdx];
      const currentFrameParseInfo = this.parsedFrames[frameIdx];
      // disposalType 2 should clear canvas
      if (currentFrameParseInfo.disposalType !== 1) {
        this.containerCtx.clearRect(0, 0, this.containerCanvas.width, this.containerCanvas.height);
      }
      // 添加gif背景颜色
      if(this.containerCtx.globalCompositeOperation && this.cropperJsOpts?.background) {
        this.containerCtx.fillStyle = this.cropperJsOpts?.background || "";
        this.containerCtx.globalCompositeOperation = "destination-over";
        this.containerCtx.fillRect(0, 0, this.containerCanvas.width, this.containerCanvas.height);
        this.containerCtx.globalCompositeOperation = "source-over";
      }

      // 裁剪转换当前帧
      if (!currentFrame) continue;
      const imageData = this.transformFrame(
        this.drawImgDataToCanvas(
          currentFrame, 
          frameIdx
        ),
      );
      this.resultFrames.push(imageData);
      // debug
      this.ifDebugRun(imageData, frameIdx);
      frameIdx++;
    }

    return this.resultFrames;
  }

  public cropStaticImage(canvasImageContainer: HTMLCanvasElement): ImageData {
    return this.transformFrame(canvasImageContainer);
  }

  private transformFrame(canvasImageContainer: HTMLCanvasElement): ImageData {
    this.containerCtx.save();
    // 判断偏移方向
    this.containerCtx.translate(this.containerCenterX, this.containerCenterY);
    this.containerCtx.rotate((this.cropperJsOpts.rotate * Math.PI) / 180);
    this.containerCtx.scale(this.cropperJsOpts.scaleX, this.cropperJsOpts.scaleY);

    this.containerCtx.drawImage(
      canvasImageContainer,
      -this.convertorCanvas.width / 2,
      -this.convertorCanvas.height / 2
    );
    this.containerCtx.restore();
    const moveCropBoxDirection = 1;
    const imageData = this.containerCtx.getImageData(
      moveCropBoxDirection * this.cropperJsOpts.x + this.offsetX,
      moveCropBoxDirection * this.cropperJsOpts.y + this.offsetY,
      this.cropperJsOpts.width,
      this.cropperJsOpts.height
    );

    return imageData;
  }

  private drawImgDataToCanvas(frame: ImageData, index: number): HTMLCanvasElement {
    const dims = this.parsedFrames[index]?.dims;
    this.convertCtx.clearRect(0, 0, this.convertorCanvas.width, this.convertorCanvas.height);
    this.convertCtx.putImageData(frame, dims.left, dims.top);

    return this.convertorCanvas;
  }

  private ifDebugRun(imageData: ImageData, index?: number) {
    // debug
    const isDebug = location.search.includes('isCropDebug=true')
    isDebug && index && this.renderEachFrame(imageData, index);
  }

  private renderEachFrame(frame: ImageData, index: number): void {
    const dims = this.parsedFrames[index]?.dims;
    const eachCanvas = document.createElement('canvas');

    // set w h
    eachCanvas.width = this.convertorCanvas.width;
    eachCanvas.height = this.convertorCanvas.height;

    // put image
    const ctx = eachCanvas.getContext('2d');
    if (!ctx) return;
    ctx?.putImageData(frame, dims.left, dims.top);

    // write index
    ctx.fillStyle = 'red'
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 5;
    ctx.save()
    ctx.beginPath();
    ctx.font = '70px orbitron'
    ctx.fillText(String(index), 10, 50);
    ctx.restore()
    ctx.closePath();

    // append to screen
    document.body.appendChild(eachCanvas);
  }

  private setupCanvas() {
    const containerCanvas = (this.containerCanvas = document.createElement('canvas'));
    const convertorCanvas = (this.convertorCanvas = document.createElement('canvas'));
    containerCanvas.className = 'containerCanvas';
    convertorCanvas.className = 'convertorCanvas';
    containerCanvas.style.display = 'none';
    convertorCanvas.style.display = 'none';

    const containerCtx = containerCanvas.getContext('2d', { willReadFrequently: true });
    const convertCtx = convertorCanvas.getContext('2d');
    containerCtx && (this.containerCtx = containerCtx);
    convertCtx && (this.convertCtx = convertCtx);

    document.body.appendChild(convertorCanvas);
    document.body.appendChild(containerCanvas);
  }

  private setCanvasWH() {
    // 计算弧度
    const radian = (Math.PI / 180) * this.cropperJsOpts.rotate;
    const imageData = this.commonCropOptions.imageData;
    // 计算旋转后的容器宽高
    const rotatedBoxWidth = imageData.naturalWidth;
      // Math.abs(imageData.naturalWidth * Math.cos(radian)) +
      // Math.abs(imageData.naturalHeight * Math.sin(radian));
    const rotatedBoxHeight =  imageData.naturalHeight;
      // Math.abs(imageData.naturalHeight * Math.cos(radian)) +
      // Math.abs(imageData.naturalWidth * Math.sin(radian));

    // 计算偏移量
    this.offsetX = -Math.min(this.cropperJsOpts.x, 0);
    this.offsetY = -Math.min(this.cropperJsOpts.y, 0);
    // 计算容器中心位置
    this.containerCenterX = this.offsetX + rotatedBoxWidth / 2;
    this.containerCenterY = this.offsetY + rotatedBoxHeight / 2;

    // 设置容器宽高
    this.containerCanvas.width = Math.max(
      this.offsetX + rotatedBoxWidth,
      this.offsetX + this.cropperJsOpts.width,
      this.cropperJsOpts.x + this.cropperJsOpts.width
    );
    this.containerCanvas.height = Math.max(
      this.offsetY + rotatedBoxHeight,
      this.offsetY + this.cropperJsOpts.height,
      this.cropperJsOpts.y + this.cropperJsOpts.height
    );

    this.convertorCanvas.width = imageData.naturalWidth;
    this.convertorCanvas.height = imageData.naturalHeight;

    // 清理画布
    this.containerCtx.clearRect(0, 0, this.containerCanvas.width, this.containerCanvas.height);
    this.convertCtx.clearRect(0, 0, this.convertorCanvas.width, this.convertorCanvas.height);
  }

  private frameToImgData(ctx: CanvasRenderingContext2D | null, frame: ParsedFrame) {
    if (!ctx) return;
    const totalPixels = frame.pixels.length;
    const imgData = ctx.createImageData(frame.dims.width, frame.dims.height);
    const patchData = imgData.data;
    for (let i = 0; i < totalPixels; i++) {
      const pos = i * 4;
      const colorIndex = frame.pixels[i];
      const color = frame.colorTable[colorIndex];
      patchData[pos] = color[0];
      patchData[pos + 1] = color[1];
      patchData[pos + 2] = color[2];
      patchData[pos + 3] = colorIndex !== frame.transparentIndex ? 255 : 0;
    }
    return imgData;
  }
}
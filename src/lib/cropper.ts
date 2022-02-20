import { ICommonCropOptions } from '../index';
import { ParsedFrame } from 'gifuct-js';

export interface IFrameCropperProps {
  commonCropOptions: ICommonCropOptions;
  frames: ParsedFrame[];
}

export class FrameCropper {
  private frames: ParsedFrame[];
  private commonCropOptions: ICommonCropOptions;
  private convertorCanvas!: HTMLCanvasElement;
  private containerCanvas!: HTMLCanvasElement;
  private convertCtx!: CanvasRenderingContext2D;
  private containerCtx!: CanvasRenderingContext2D;
  private cropperJsOpts;
  private offsetX = 0;
  private offsetY = 0;
  private containerCenterX = 0;
  private containerCenterY = 0;
  private resultFrames: ImageData[] = [];
  private frameDelays: number[] = [];

  constructor({ commonCropOptions, frames }: IFrameCropperProps) {
    this.frames = frames;
    this.commonCropOptions = commonCropOptions;
    this.cropperJsOpts = commonCropOptions.cropperJsOpts;

    this.setupCanvas();
  }

  public async bootstrap() {
    let frameIdx = 0;
    while (frameIdx < this.frames.length) {
      const currentFrame = this.frames[frameIdx];
      const frameImgData = this.frameToImgData(this.convertCtx, currentFrame);

      // 添加gif背景颜色
      if(frameIdx == 0 && this.containerCtx.globalCompositeOperation) {
        this.containerCtx.fillStyle = this.cropperJsOpts?.background || "";
        this.containerCtx.globalCompositeOperation = "destination-over";
        this.containerCtx.fillRect(0, 0, this.containerCanvas.width, this.containerCanvas.height);
        this.containerCtx.globalCompositeOperation = "source-over";
      }
      // 裁剪转换当前帧
      this.transformFrame(currentFrame, frameImgData);
      frameIdx++;
    }

    return {
      resultFrames: this.resultFrames,
      frameDelays: this.frameDelays
    };
  }


  private transformFrame(frame: ParsedFrame, frameImgData: ImageData | undefined): void {
    if (!frameImgData) return;
    this.containerCtx.save();
    // 判断偏移方向
    const translateDirection = (this.cropperJsOpts.rotate % 360) >= 180 ? -1 : 1;
    this.containerCtx.translate(this.containerCenterX * translateDirection, this.containerCenterY * translateDirection);
    this.containerCtx.rotate((this.cropperJsOpts.rotate * Math.PI) / 180);
    this.containerCtx.scale(this.cropperJsOpts.scaleX, this.cropperJsOpts.scaleY);

    this.containerCtx.drawImage(
      this.drawImgDataToCanvas(frame, frameImgData),
      -this.convertorCanvas.width / 2,
      -this.convertorCanvas.height / 2
    );
    this.containerCtx.restore();
    const moveCropBoxDirection = this.commonCropOptions.withoutCropperJs ? -1 : 1;
    const imageData = this.containerCtx.getImageData(
      moveCropBoxDirection * this.cropperJsOpts.x + this.offsetX,
      moveCropBoxDirection * this.cropperJsOpts.y + this.offsetY,
      this.cropperJsOpts.width,
      this.cropperJsOpts.height
    );

    this.resultFrames.push(imageData);
    this.frameDelays.push(frame.delay);
  }

  private drawImgDataToCanvas(frame: ParsedFrame, frameImgData: ImageData): CanvasImageSource {
    this.convertCtx.clearRect(
      0,
      0,
      this.commonCropOptions.imageData.naturalWidth,
      this.commonCropOptions.imageData.naturalHeight
    );
    this.convertCtx.putImageData(frameImgData, frame.dims.left, frame.dims.top);
    return this.convertorCanvas;
  }

  private setupCanvas() {
    const containerCanvas = (this.containerCanvas = document.createElement('canvas'));
    const convertorCanvas = (this.convertorCanvas = document.createElement('canvas'));
    containerCanvas.className = 'containerCanvas';
    convertorCanvas.className = 'convertorCanvas';
    containerCanvas.style.display = 'none';
    convertorCanvas.style.display = 'none';

    const containerCtx = containerCanvas.getContext('2d');
    const convertCtx = convertorCanvas.getContext('2d');
    containerCtx && (this.containerCtx = containerCtx);
    convertCtx && (this.convertCtx = convertCtx);

    this.setCanvasWH();

    document.body.appendChild(convertorCanvas);
    document.body.appendChild(containerCanvas);
  }

  private setCanvasWH() {
    // 计算弧度
    const radian = (Math.PI / 180) * this.cropperJsOpts.rotate;
    const imageData = this.commonCropOptions.imageData;
    // 计算旋转后的容器宽高
    const rotatedBoxWidth =
      imageData.naturalWidth * Math.cos(radian) +
      imageData.naturalHeight * Math.sin(radian);
    const rotatedBoxHeight =
      imageData.naturalHeight * Math.cos(radian) +
      imageData.naturalWidth * Math.sin(radian);

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
    // 清理画布
    this.containerCtx.clearRect(0, 0, this.containerCanvas.width, this.containerCanvas.height);

    this.convertorCanvas.width = imageData.naturalWidth;
    this.convertorCanvas.height = imageData.naturalHeight;
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

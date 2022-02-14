import { ICropperOptions, CustomCropper } from '../index';
import { ParsedFrame } from 'gifuct-js';

export interface IFrameCropperProps {
  cropperOptions: ICropperOptions;
  cropperInstance: CustomCropper;
  frames: ParsedFrame[];
}

export class FrameCropper {
  private frames: ParsedFrame[];
  private cropperInstance: CustomCropper;
  private cropperOptions: ICropperOptions;
  private convertorCanvas!: HTMLCanvasElement;
  private containerCanvas!: HTMLCanvasElement;
  private convertCtx!: CanvasRenderingContext2D;
  private containerCtx!: CanvasRenderingContext2D;
  private canvasBoxData;
  private cropArea;
  private offsetX = 0;
  private offsetY = 0;
  private containerCenterX = 0;
  private containerCenterY = 0;
  private resultFrames: ImageData[] = [];
  private frameDelays: number[] = [];

  constructor({ cropperOptions, cropperInstance, frames }: IFrameCropperProps) {
    this.frames = frames;
    this.cropperInstance = cropperInstance;
    this.cropperOptions = cropperOptions;
    // 兼容未配合 cropperJs 场景
    this.canvasBoxData = Object.assign({
      naturalHeight: this.cropperOptions.cropperJsOpts?.height,
      naturalWidth: this.cropperOptions.cropperJsOpts?.width
    }, this.cropperInstance.getCanvasData());

    this.cropArea = Object.assign(this.cropperOptions.cropperJsOpts, this.cropperInstance.getData());
    this.setupCanvas();
  }

  public async bootstrap() {
    let frameIdx = 0;
    while (frameIdx < this.frames.length) {
      const currentFrame = this.frames[frameIdx];
      const frameImgData = this.frameToImgData(this.convertCtx, currentFrame);

      // 添加gif背景颜色
      if(frameIdx == 0 && this.containerCtx.globalCompositeOperation) {
        this.containerCtx.fillStyle = this.cropperOptions.cropperJsOpts?.background || "";
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
    const cropOutputData = this.cropArea;
    this.containerCtx.save();
    this.containerCtx.translate(this.containerCenterX, this.containerCenterY);
    this.containerCtx.rotate((cropOutputData.rotate * Math.PI) / 180);
    this.containerCtx.scale(cropOutputData.scaleX, cropOutputData.scaleY);
    this.containerCtx.drawImage(
      this.drawImgDataToCanvas(frame, frameImgData),
      -this.convertorCanvas.width / 2,
      -this.convertorCanvas.height / 2
    );
    this.containerCtx.restore();

    const imageData = this.containerCtx.getImageData(
      this.cropArea.x + this.offsetX,
      this.cropArea.y + this.offsetY,
      this.cropArea.width,
      this.cropArea.height
    );

    this.resultFrames.push(imageData);
    this.frameDelays.push(frame.delay);
  }

  private drawImgDataToCanvas(frame: ParsedFrame, frameImgData: ImageData): CanvasImageSource {
    this.convertCtx.clearRect(
      0,
      0,
      this.canvasBoxData.naturalWidth,
      this.canvasBoxData.naturalHeight
    );
    this.convertCtx.putImageData(frameImgData, frame.dims.left, frame.dims.top);
    return this.convertorCanvas;
  }

  private setupCanvas() {
    const containerCanvas = (this.containerCanvas = document.createElement('canvas'));
    const convertorCanvas = (this.convertorCanvas = document.createElement('canvas'));

    const containerCtx = containerCanvas.getContext('2d');
    const convertCtx = convertorCanvas.getContext('2d');
    containerCtx && (this.containerCtx = containerCtx);
    convertCtx && (this.convertCtx = convertCtx);

    this.setCanvasWH();

    document.body.appendChild(convertorCanvas);
    document.body.appendChild(containerCanvas);
  }

  private setCanvasWH() {
    const radian = (Math.PI / 180) * this.cropArea.rotate;
    const rotatedBoxWidth =
      this.canvasBoxData.naturalWidth * Math.cos(radian) +
      this.canvasBoxData.naturalHeight * Math.sin(radian);
    const rotatedBoxHeight =
      this.canvasBoxData.naturalHeight * Math.cos(radian) +
      this.canvasBoxData.naturalWidth * Math.sin(radian);

    this.offsetX = -Math.min(this.cropArea.x, 0);
    this.offsetY = -Math.min(this.cropArea.y, 0);
    this.containerCenterX = this.offsetX + rotatedBoxWidth / 2;
    this.containerCenterY = this.offsetY + rotatedBoxHeight / 2;

    this.containerCanvas.width = Math.max(
      this.offsetX + rotatedBoxWidth,
      this.offsetX + this.cropArea.width,
      this.cropArea.x + this.cropArea.width
    );
    this.containerCanvas.height = Math.max(
      this.offsetY + rotatedBoxHeight,
      this.offsetY + this.cropArea.height,
      this.cropArea.y + this.cropArea.height
    );
    this.containerCtx.clearRect(0, 0, this.containerCanvas.width, this.containerCanvas.height);

    this.convertorCanvas.width = this.canvasBoxData.naturalWidth;
    this.convertorCanvas.height = this.canvasBoxData.naturalHeight;
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

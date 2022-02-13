import { ICropperOptions, CustomCropper } from '../index'
import {  ParsedFrame } from 'gifuct-js'

export interface IFrameCropperProps {
  cropperOptions: ICropperOptions;
  cropperInstance: CustomCropper;
  frames: ParsedFrame[]
}

export class FrameCropper {
  private frames: ParsedFrame[];
  private cropperInstance: CustomCropper;
  private cropperOptions: ICropperOptions
  private convertCanvas!: HTMLCanvasElement;
  private containerCanvas!: HTMLCanvasElement;
  private convertCtx!: CanvasRenderingContext2D;
  private containerCtx!: CanvasRenderingContext2D;

  constructor({
    cropperOptions,
    cropperInstance,
    frames
  }: IFrameCropperProps) {
    this.frames = frames;
    this.cropperInstance = cropperInstance;
    this.cropperOptions = cropperOptions;
    this.setupCanvas();
  }

  public async bootstrap() {
    let frameIdx = 0;
    while (frameIdx < this.frames.length) {
      const currentFrame = this.frames[frameIdx];
      const frameImgData = this.frameToImgData(this.convertCtx, currentFrame);
      this.transformFrame(currentFrame, frameImgData);
      frameIdx++;
    }
  }

  private transformFrame(frame: ParsedFrame, frameImgData: ImageData | undefined): void {
    if (!frameImgData) return;
    this.containerCtx.save();
    this.containerCtx.translate(0, 0);
    // this.containerCtx.rotate(cropArea.rotate*Math.PI/180);
    // this.containerCtx.scale(cropArea.scaleX, cropArea.scaleY);
    this.containerCtx.drawImage(this.drawImgDataToCanvas(frame, frameImgData), 200, 200);
    this.containerCtx.restore();
  }

  private drawImgDataToCanvas(frame: ParsedFrame, frameImgData: ImageData): CanvasImageSource {
    this.convertCtx.clearRect(0,0, 200, 200);
    this.convertCtx.putImageData(frameImgData, frame.dims.left, frame.dims.top);
    return this.convertCanvas;
  }

  private setupCanvas() {
    const containerCanvas = this.containerCanvas = document.createElement('canvas');
    const convertCanvas = this.convertCanvas = document.createElement('canvas');
    containerCanvas.style.width = '200px';
    containerCanvas.style.height = '200px'
    containerCanvas.style.border = '1px solid black';

    convertCanvas.style.width = '200px';
    convertCanvas.style.height = '200px'
    convertCanvas.style.border = '1px solid black';

    const containerCtx = containerCanvas.getContext('2d');
    const convertCtx = convertCanvas.getContext('2d');
    containerCtx && (this.containerCtx = containerCtx);
    convertCtx && (this.convertCtx = convertCtx);
    document.body.appendChild(containerCanvas);
    document.body.appendChild(convertCanvas);
  }

  private frameToImgData(ctx: CanvasRenderingContext2D | null, frame: ParsedFrame) {
    if (!ctx) return;
    const totalPixels = frame.pixels.length;
    const imgData = ctx.createImageData(frame.dims.width, frame.dims.height);
		const patchData = imgData.data;
		for(let i=0; i<totalPixels; i++){
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
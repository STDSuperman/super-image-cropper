import { transformToUrl as gifWorkerTransformToUrl } from 'gif-build-worker-js';
import GIF from 'gif.js';
import { ICropperOptions, CustomCropper } from '../index'

export interface IFrameCropperProps {
  cropperOptions: ICropperOptions;
  cropperInstance: CustomCropper;
  frames: ImageData[];
  frameDelays: number[]
}
export class SyntheticGIF {
  private cropArea;
  private frames;
  private frameDelays;
  private cropperInstance;

  constructor({
    cropperInstance,
    frames,
    cropperOptions,
    frameDelays
  }: IFrameCropperProps) {
    this.cropArea = cropperInstance.getData();
    this.frames = frames;
    this.frameDelays = frameDelays;
    this.cropperInstance = cropperInstance;
  }

  public async bootstrap() {
    const gifWorkerUrl = gifWorkerTransformToUrl();
    const gif = new GIF({
      workers: 2,
      quality: 10,
      workerScript: gifWorkerUrl,
      width: this.cropArea.width,
      height: this.cropArea.height
    });

    gif.on('finished', (blob: Blob) => {
      const img = document.createElement('img');
      img.src = window.URL.createObjectURL(blob);
      document.body.appendChild(img);
      console.log(blob);
    })

    this.frames.forEach((frame, idx) => {
      gif.addFrame(frame, { delay: this.frameDelays[idx] });
    });

    gif.render();
  }
}

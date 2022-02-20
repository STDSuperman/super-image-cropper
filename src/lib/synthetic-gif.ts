import { transformToUrl as gifWorkerTransformToUrl } from 'gif-build-worker-js';
import GIF from 'gif.js';
import { ICommonCropOptions } from '../index'

export interface IFrameCropperProps {
  commonCropOptions: ICommonCropOptions,
  frames: ImageData[];
  frameDelays: number[]
}
export class SyntheticGIF {
  private cropperJsOpts;
  private frames;
  private frameDelays;

  constructor({
    frames,
    commonCropOptions,
    frameDelays
  }: IFrameCropperProps) {
    this.cropperJsOpts = commonCropOptions.cropperJsOpts;
    this.frames = frames;
    this.frameDelays = frameDelays;
  }

  public bootstrap(): Promise<string> {
    return new Promise((resolve, reject) => {
      const gifWorkerUrl = gifWorkerTransformToUrl();
      const gif = new GIF({
        workers: 2,
        quality: 10,
        workerScript: gifWorkerUrl,
        width: this.cropperJsOpts.width,
        height: this.cropperJsOpts.height
      });
      gif.on('finished', (blob: Blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        resolve(blobUrl);
      })

      this.frames.forEach((frame, idx) => {
        gif.addFrame(frame, { delay: this.frameDelays[idx] });
      });

      gif.render();
    })
  }
}

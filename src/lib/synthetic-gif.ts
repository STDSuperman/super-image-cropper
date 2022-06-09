import { transformToUrl as gifWorkerTransformToUrl } from 'gif-build-worker-js';
import GIF from 'gif.js';
import { ICommonCropOptions, ICropperOptions } from '../index';

export interface IFrameCropperProps {
  commonCropOptions: ICommonCropOptions;
  frames: ImageData[];
  frameDelays: number[];
  gifJsOptions?: ICropperOptions['gifJsOptions'];
}
export class SyntheticGIF {
  private cropperJsOpts;
  private frames;
  private frameDelays;
  private gifJsOptions;

  constructor({ frames, commonCropOptions, frameDelays, gifJsOptions = {} }: IFrameCropperProps) {
    this.cropperJsOpts = commonCropOptions.cropperJsOpts;
    this.frames = frames;
    this.frameDelays = frameDelays;
    this.gifJsOptions = gifJsOptions;
  }

  public bootstrap(): Promise<string> {
    return new Promise((resolve, reject) => {
      const gifWorkerUrl = gifWorkerTransformToUrl();
      const gif = new GIF(
        Object.assign(
          {
            workers: 2,
            quality: 10,
            workerScript: gifWorkerUrl,
            width: this.cropperJsOpts.width,
            height: this.cropperJsOpts.height
          },
          this.gifJsOptions || {}
        )
      );
      gif.on('finished', (blob: Blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        resolve(blobUrl);
      });

      this.frames.forEach((frame, idx) => {
        gif.addFrame(frame, { delay: this.frameDelays[idx] });
      });

      gif.render();
    });
  }
}

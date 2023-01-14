import { transformToUrl as gifWorkerTransformToUrl } from 'gif-build-worker-js';
import GIF from 'gif.js';
import { ICommonCropOptions, ICropperOptions } from '../index';
import { IOutputTypeUnion, OutputType } from '../index';

export interface IFrameCropperProps {
  commonCropOptions: ICommonCropOptions;
  frames: ImageData[];
  frameDelays: number[];
  gifJsOptions?: ICropperOptions['gifJsOptions'];
  outputType?: IOutputTypeUnion;
}
export class SyntheticGIF {
  private cropperJsOpts;
  private frames;
  private frameDelays;
  private gifJsOptions;
  private outputType;

  constructor({ frames, commonCropOptions, frameDelays, gifJsOptions = {}, outputType }: IFrameCropperProps) {
    this.cropperJsOpts = commonCropOptions.cropperJsOpts;
    this.frames = frames;
    this.frameDelays = frameDelays;
    this.gifJsOptions = gifJsOptions;
    this.outputType = outputType;
  }

  public bootstrap(): Promise<string | Blob> {
    return new Promise((resolve, reject) => {
      const gifWorkerUrl = gifWorkerTransformToUrl();
      const gif = new GIF(
        Object.assign(
          {
            workers: 2,
            quality: 10,
            workerScript: gifWorkerUrl,
            width: this.cropperJsOpts.width,
            height: this.cropperJsOpts.height,
            transparent: 'transparent',
          },
          this.gifJsOptions || {}
        )
      );
      gif.on('finished', (blob: Blob) => {
        if (this.outputType === OutputType.BLOB) {
          resolve(blob);
        } else if (this.outputType === OutputType.BASE64) {
          resolve(this.convertBlob2Base64(blob));
        } else {
          const blobUrl = window.URL.createObjectURL(blob);
          resolve(blobUrl);
        }
      });

      this.frames.forEach((frame, idx) => {
        gif.addFrame(frame, { delay: this.frameDelays[idx] });
      });

      gif.render();
    });
  }

  private convertBlob2Base64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(event) {
        resolve(event?.target?.result as string)
      };
      reader.onerror = (e) => {
        reject(e);
      }
      reader.readAsDataURL(blob);
    })
  }
}

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
    // 兼容未结合 cropperJs 场景
    if (!this.cropArea.width) this.cropArea.width = cropperOptions.cropperJsOpts?.width || 0;
    if (!this.cropArea.height) this.cropArea.height = cropperOptions.cropperJsOpts?.height || 0;

    this.frames = frames;
    this.frameDelays = frameDelays;
    this.cropperInstance = cropperInstance;
  }

  public bootstrap(): Promise<string> {
    return new Promise((resolve, reject) => {
      const gifWorkerUrl = gifWorkerTransformToUrl();
      const gif = new GIF({
        workers: 2,
        quality: 10,
        workerScript: gifWorkerUrl,
        width: this.cropArea.width,
        height: this.cropArea.height
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

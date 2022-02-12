import Cropper from 'cropperjs'
import { Decoder, IFrames } from './lib/decoder'
import GIF from 'gif.js';
import { transformToUrl as gifWorkerTransformToUrl } from 'gif-worker-js'

export class CustomCropper extends Cropper {
  public url = '';
}

export interface ICropperOptions {
  cropperInstance?: CustomCropper;
  src?: string;
  cropOpts?: ICropOpts
}

export interface ICropOpts {
  width: number;
  height: number;
  scaleX?: number;
  scaleY?: number;
  left?: number;
  top?: number;
  background?: boolean;
  compress?: boolean;
}

export class GIFCropper {
  private cropperOptions: ICropperOptions = {
    cropOpts: {
      width: 100,
      height: 100,
      scaleX: 1,
      scaleY: 1,
      left: 0,
      top: 0,
      compress: false
    },
  };
  private cropperInstance: CustomCropper
  private imageInstance?: HTMLImageElement;
  private preImageSrc = '';
  private frames: IFrames = [];
  constructor(cropperOptions: ICropperOptions) {
    let options = cropperOptions;

    // ensure cropperInstance exist.
    if (!options.cropperInstance) {
      this.cropperInstance = this.createCropperInstance(cropperOptions);
    } else {
      this.cropperInstance = options.cropperInstance;
    }

    this.cropperOptions = Object.assign(this.cropperOptions, options);
  }

  public async crop() {
    await this.decodeGIF();
    await this.saveGif();
  }

  private createCropperInstance(options: ICropperOptions): CustomCropper {
    if (!options.src) {
      throw new Error('Option src must be specified.')
    }
    const img = document.createElement('img');
    img.src = options.src;
    if (this.imageInstance) {
        document.body.removeChild(this.imageInstance);
        this.cropperInstance?.destroy();
    }
    this.imageInstance = document.createElement('img');
    this.imageInstance.src = options.src;
    this.imageInstance.style.display = 'none';
    document.body.append(this.imageInstance);
    if (this.preImageSrc !== options.src) {
        this.preImageSrc = options.src;
        this.imageInstance.src = options.src;
    }
    return new CustomCropper(this.imageInstance, {
        viewMode: 1,
        background: options.cropOpts?.background,
        data: options.cropOpts,
        autoCrop: true
    });
  }

  private async decodeGIF() {
    const decoder = new Decoder(this.cropperOptions.src || this.cropperInstance.url);
    const decodedGIFData = await decoder.decode();
    this.frames = decodedGIFData.frames;
  }

  private async saveGif() {
    const gifWorkerUrl = gifWorkerTransformToUrl();
    const gif = new GIF({
      workers: 2,
      quality: 10,
      workerScript: gifWorkerUrl
    });
    this.frames.forEach(frame => {});
    console.log(gif);
  }
}
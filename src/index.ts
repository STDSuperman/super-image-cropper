import Cropper from 'cropperjs';
import { Decoder } from './lib/decoder';
import { SyntheticGIF } from './lib/synthetic-gif';
import { FrameCropper } from './lib/cropper';
import { ParsedFrame } from 'gifuct-js';

export class CustomCropper extends Cropper {
  public url = '';
  public cropBoxData!: Cropper.ImageData;
  public canvasData!: Cropper.ImageData;
}

export interface ICropperOptions {
  cropperInstance?: CustomCropper;
  src?: string;
  cropOpts?: ICropOpts;
}

export interface ICropOpts {
  width: number;
  height: number;
  scaleX?: number;
  scaleY?: number;
  left?: number;
  top?: number;
  background?: string;
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
    }
  };
  private cropperInstance: CustomCropper;
  private imageInstance?: HTMLImageElement;
  private preImageSrc = '';
  private frames: ParsedFrame[] = [];
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
    const { resultFrames, frameDelays } = await this.cropFrames();
    await this.saveGif(resultFrames, frameDelays);
  }

  private createCropperInstance(options: ICropperOptions): CustomCropper {
    if (!options.src) {
      throw new Error('Option src must be specified.');
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
      background: !!options.cropOpts?.background,
      data: options.cropOpts,
      autoCrop: true
    });
  }

  private async decodeGIF() {
    const decoder = new Decoder(this.cropperOptions.src || this.cropperInstance.url);
    const decodedGIFFrames = await decoder.decompressFrames();
    this.frames = decodedGIFFrames;
    return decodedGIFFrames;
  }

  private async cropFrames() {
    const frameCropper = new FrameCropper({
      cropperOptions: this.cropperOptions,
      cropperInstance: this.cropperInstance,
      frames: this.frames
    });
    return frameCropper.bootstrap();
  }

  private async saveGif(resultFrames: ImageData[], frameDelays: number[]) {
    const syntheticGIF = new SyntheticGIF({
      frames: resultFrames,
      cropperInstance: this.cropperInstance,
      cropperOptions: this.cropperOptions,
      frameDelays
    });
    return syntheticGIF.bootstrap();
  }
}

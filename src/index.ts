import Cropper from 'cropperjs';
import { Decoder } from './lib/decoder';
import { SyntheticGIF } from './lib/synthetic-gif';
import { FrameCropper } from './lib/cropper';
import { ParsedFrame } from 'gifuct-js';

export interface CustomCropper extends Cropper {
  url: '';
  cropBoxData: Cropper.ImageData;
  canvasData: Cropper.ImageData;
  cropper?: HTMLDivElement
}

export interface ICropperOptions {
  cropperInstance?: CustomCropper;
  src?: string;
  cropperJsOpts?: ICropOpts;
  compress?: boolean;
}

export interface ICropOpts {
  width: number;
  height: number;
  scaleX?: number;
  scaleY?: number;
  left?: number;
  top?: number;
  background?: string;
  rotate?: number;
}

export class GIFCropper {
  private cropperOptions: ICropperOptions = {
    cropperJsOpts: {
      width: 100,
      height: 100,
      scaleX: 1,
      scaleY: 1,
      left: 0,
      top: 0,
      rotate: 0
    },
    compress: false
  };
  private cropperInstance!: CustomCropper;
  private imageInstance?: HTMLImageElement;
  private preImageSrc = '';
  private frames: ParsedFrame[] = [];
  constructor(private inputCropperOptions: ICropperOptions) {}

  public async crop(): Promise<string> {
    await this.init();
    await this.decodeGIF();
    console.log('解码完毕')
    const { resultFrames, frameDelays } = await this.cropFrames();
    console.log('裁剪完毕', resultFrames)
    return this.saveGif(resultFrames, frameDelays);
  }

  private async init() {
    // 合并初始值
    this.cropperOptions.cropperJsOpts = Object.assign(this.cropperOptions.cropperJsOpts, this.inputCropperOptions.cropperJsOpts);
    this.cropperOptions = Object.assign(this.inputCropperOptions, this.cropperOptions);

    // ensure cropperInstance exist.
    if (!this.inputCropperOptions.cropperInstance) {
      this.cropperInstance = await this.createCropperInstance(this.cropperOptions);
    } else {
      this.cropperInstance = this.inputCropperOptions.cropperInstance;
    }
  }

  private createCropperInstance(options: ICropperOptions): Promise<CustomCropper> {
    return new Promise<CustomCropper>((resolve, reject) => {
      if (!options.src) {
        throw new Error('Option src must be specified.');
      }
      const img = document.createElement('img');
      img.src = options.src;
      if (this.imageInstance) {
        document.body.removeChild(this.imageInstance);
        this.cropperInstance?.destroy();
      }
      // 创建新的 image 图片 DOM
      this.imageInstance = document.createElement('img');
      this.imageInstance.src = options.src;
      this.imageInstance.style.display = 'none';
      document.body.append(this.imageInstance);
      if (this.preImageSrc !== options.src) {
        this.preImageSrc = options.src;
        this.imageInstance.src = options.src;
      }

      // 实例化一个 cropper
      const newInstance = new Cropper(this.imageInstance, {
        viewMode: 1,
        background: !!options.cropperJsOpts?.background,
        data: options.cropperJsOpts,
        autoCrop: true
      }) as CustomCropper;

      // 隐藏裁剪 DOM
      this.imageInstance.addEventListener('ready', function () {
        if (newInstance.cropper) {
          newInstance.cropper.style.display = 'none';
          resolve(newInstance);
        }
      });

    })
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

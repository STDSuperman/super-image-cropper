import Cropper from 'cropperjs';
import { Decoder } from './lib/decoder';
import { SyntheticGIF } from './lib/synthetic-gif';
import { FrameCropper } from './lib/cropper';
import { getImageInfo, loadImage, getImageType, IImageTypeInfo } from './lib/helper';
import type { IParsedFrameInfo } from './lib/decoder';
export interface CustomCropper extends Cropper {
  url: '';
  cropBoxData: Cropper.ImageData;
  canvasData: Cropper.ImageData;
  cropper?: HTMLDivElement
}

export enum OutputType {
  BASE64 = 'base64',
  BLOB = 'blob',
  BLOB_URL = 'blobURL',
}

export type IOutputTypeUnion = `${OutputType}`;
export interface ICropperOptions {
  cropperInstance?: CustomCropper | Cropper;
  src?: string;
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
  cropperJsOpts?: ICropOpts;
  gifJsOptions?: IGifOpts;
  outputType?: IOutputTypeUnion;
}

export interface IGifOpts {
  repeat?: number;
  quality?: number;
  workers?: number;
  workerScript?: string;
  background?: string;
  width?: number;
  height?: number;
  transparent?: string | null;
  dither?: boolean;
  debug?: boolean;
}

export interface ICropOpts {
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  x?: number;
  y?: number;
  background?: string;
  rotate?: number;
  left?: number;
  top?: number;
}

export interface IImageData {
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
}

export interface ICommonCropOptions {
  cropperJsOpts: Required<ICropOpts>;
  imageData: IImageData;
  cropBoxData: Cropper.CropBoxData
  withoutCropperJs: boolean;
}

export class SuperImageCropper {
  private cropperJsInstance?: CustomCropper;
  private imageInstance?: HTMLImageElement;
  private preImageSrc = '';
  private parsedFrameInfo!: IParsedFrameInfo;
  private commonCropOptions!: ICommonCropOptions;
  private frameCropperInstance!: FrameCropper;
  private inputCropperOptions!: ICropperOptions;
  private imageTypeInfo: IImageTypeInfo | null = null;

  public async crop(
    inputCropperOptions: ICropperOptions
  ): Promise<string | Blob> {
    this.inputCropperOptions = this.cleanUserInput(inputCropperOptions);
    this.userInputValidator(this.inputCropperOptions);
    await this.init();
    await this.decodeGIF();
    if (await this.checkIsStaticImage()) {
      return this.handleStaticImage()
    } else {
      const resultFrames = await this.cropFrames();
      return this.saveGif(resultFrames, this.parsedFrameInfo?.delays || []);
    }
  }

  private async init() {
    this.cropperJsInstance = this.inputCropperOptions.cropperInstance as CustomCropper;
    // 合并初始值
    const defaultOptions: ICropOpts = {
      width: 100,
      height: 100,
      scaleX: 1,
      scaleY: 1,
      x: 0,
      y: 0,
      rotate: 0,
      left: 0,
      top: 0
    }
    const targetConfig = Object.assign(
      defaultOptions,
      this.inputCropperOptions.cropperJsOpts || {},
      this.cropperJsInstance?.getData() || {}
    );

    const imageData = this.cropperJsInstance?.getImageData()
      || await getImageInfo({
        src: this.inputCropperOptions.src,
        crossOrigin: this.inputCropperOptions.crossOrigin
      })
      || {}
    ;

    this.commonCropOptions = {
      cropperJsOpts: this.imageDataFormat(targetConfig, imageData),
      imageData,
      cropBoxData: this.cropperJsInstance?.getCropBoxData() || targetConfig,
      withoutCropperJs: !this.cropperJsInstance
    }

    this.commonCropOptions.cropperJsOpts.rotate = this.normalizeRotate(
      this.commonCropOptions.cropperJsOpts.rotate
    );

    console.log('origin', this.commonCropOptions, targetConfig)

    // TODO: 测试
    this.commonCropOptions = {
      "cropperJsOpts": {
          "width": 400.323,
          "height": 240.323,
          "scaleX": 1,
          "scaleY": 1,
          "x": 0,
          "y": 0,
          "rotate": 0,
          "left": 0,
          "top": 0
      },
      "imageData": {
          "width": 256,
          "height": 144,
          "naturalWidth": 256,
          "naturalHeight": 144
      },
      "cropBoxData": {
          "width": 400.323,
          "height": 240.323,
          "scaleX": 1,
          "scaleY": 1,
          "x": 0,
          "y": 0,
          "rotate": 0,
          "left": 0,
          "top": 0
      },
      "withoutCropperJs": false
  } as any;

  this.commonCropOptions = {
    "cropperJsOpts": {
        "width": 227,
        "height": 144,
        "scaleX": 1,
        "scaleY": 1,
        "x": 0,
        "y": 0,
        "rotate": 0,
        "left": 0,
        "top": 0
    },
    "imageData": {
        "naturalWidth": 256,
        "naturalHeight": 144,
        "aspectRatio": 1.7777777777777777,
        "width": 942.2222222222222,
        "height": 530,
        "left": 0,
        "top": 0
    },
    "cropBoxData": {},
    "withoutCropperJs": false
  } as any

    console.log('this.commonCropOptions', this.commonCropOptions)
  }

  private cleanUserInput(cropperOptions: ICropperOptions) {
    const { cropperInstance } = cropperOptions;
    if (cropperInstance) {
      delete cropperOptions['cropperJsOpts'];
      delete cropperOptions['src']
    }
    return cropperOptions;
  }

  private userInputValidator(cropperOptions: ICropperOptions) {
    const { cropperInstance, cropperJsOpts, src } = cropperOptions;
    if (!cropperInstance) {
      if (!cropperJsOpts) {
        throw new Error('If cropperInstance is not specified, cropperJsOpts must be specified.')
      } else if (!src) {
        throw new Error('If cropperInstance is not specified, src must be specified.')
      }
    }
  }

  private normalizeRotate(rotation: number): number {
    return rotation < 0 ? 360 + (rotation % 360) : rotation;
  }

  private imageDataFormat(
    targetConfig: ICropOpts & Cropper.Data,
    imageData: IImageData
  ): Required<ICropOpts> {
    targetConfig.left = targetConfig.x;
    targetConfig.top = targetConfig.y;
    targetConfig.width = targetConfig.width || imageData.naturalWidth;
    targetConfig.height = targetConfig.height || imageData.naturalHeight;
    return targetConfig as Required<ICropOpts>;
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
        this.cropperJsInstance?.destroy();
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
      this.imageInstance.addEventListener('ready', () => {
        if (newInstance.cropper) {
          newInstance.cropper.style.display = 'none';
          if (options.cropperJsOpts?.width && this.imageInstance) {
            this.imageInstance.style.width = options.cropperJsOpts.width + 'px';
          }
          resolve(newInstance);
        }
      });

    })
  }

  private async decodeGIF(): Promise<void> {
    const decoder = new Decoder(this.inputCropperOptions.src || this.cropperJsInstance?.url || '');
    const parsedFrameInfo = await decoder.decompressFrames();
    this.parsedFrameInfo = parsedFrameInfo;
  }

  private ensureFrameCropperExist() {
    if (!this.frameCropperInstance) {
      this.frameCropperInstance = new FrameCropper({
        commonCropOptions: this.commonCropOptions
      });
    }
  }

  private async cropFrames() {
    this.ensureFrameCropperExist();
    this.frameCropperInstance.init({
      commonCropOptions: this.commonCropOptions
    });
    return this.frameCropperInstance.cropGif(this.parsedFrameInfo);
  }

  private async saveGif(resultFrames: ImageData[], frameDelays: number[]) {
    const syntheticGIF = new SyntheticGIF({
      frames: resultFrames,
      commonCropOptions: this.commonCropOptions,
      frameDelays,
      gifJsOptions: this.inputCropperOptions.gifJsOptions,
      outputType: this.inputCropperOptions.outputType,
    });
    return syntheticGIF.bootstrap();
  }

  private async checkIsStaticImage(): Promise<boolean> {
    const url = this.cropperJsInstance?.url ?? this.inputCropperOptions?.src;
    this.imageTypeInfo = await getImageType(url);
    return this.imageTypeInfo?.mime !== 'image/gif';
  }

  private async handleStaticImage(): Promise<string | Blob> {
    const imageInfo = await loadImage({
      src: this.inputCropperOptions.src,
      crossOrigin: this.inputCropperOptions.crossOrigin,
    });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = imageInfo.imageInstance.width;
    canvas.height = imageInfo.imageInstance.height;
    ctx?.drawImage(imageInfo.imageInstance, 0, 0);

    this.ensureFrameCropperExist();
    // 每次重新裁剪需要初始化一下裁剪区域相关数据
    this.frameCropperInstance.init({
      commonCropOptions: this.commonCropOptions
    });
    const croppedImageData = await this.frameCropperInstance.cropStaticImage(canvas);
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = croppedImageData.width;
    canvas.height = croppedImageData.height;
    ctx?.putImageData(croppedImageData, 0, 0);

    return new Promise((resolve, reject) => {
      const { outputType = OutputType.BLOB_URL } = this.inputCropperOptions;

      if (outputType === OutputType.BASE64) {
        resolve(canvas.toDataURL(this.imageTypeInfo?.mime));
      } else {
        canvas.toBlob((blob) => {
          if (!blob) return reject(null);
          if (outputType === OutputType.BLOB) {
            resolve(blob);
          } else {
            const blobUrl = window.URL.createObjectURL(blob);
            resolve(blobUrl);
          }
        }, this.imageTypeInfo?.mime)
      }
    })
  }
}

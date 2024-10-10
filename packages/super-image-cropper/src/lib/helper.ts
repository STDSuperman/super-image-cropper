import { IImageData } from '../index'
import imageType from 'image-type'

export type GetArrTypeUnion<T extends any[]> = T extends (infer I)[] ? I : never;
export type IImageLoadData = {
  imageInstance: HTMLImageElement;
  data: Event
  imageType: IImageTypeInfo | null;
}
export interface IImageTypeInfo {
  ext: string;
  mime: string;
}

export interface IGetImageParams {
  src?: string;
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
}

export const getImageInfo = async (params: IGetImageParams): Promise<IImageData> => {
    const { src = '' } = params;
    if (!src) return {
      width: 0,
      height: 0,
      naturalWidth: 0,
      naturalHeight: 0,
    };
    const { imageInstance } = await loadImage(params);
    return {
      width: imageInstance.width,
      height: imageInstance.height,
      naturalWidth: imageInstance.naturalWidth,
      naturalHeight: imageInstance.naturalHeight,
    };
}

export const getImageType = async (imageBufferData: ArrayBuffer): Promise<IImageTypeInfo | null> => {
  const imageTypeInfo = imageType(new Uint8Array(imageBufferData));
  return imageTypeInfo;
}

export const loadImage = (params: IGetImageParams): Promise<IImageLoadData> => {
  const { src = '', crossOrigin } = params;
  return new Promise((resolve, reject) => {
    const image = new Image();
    if (typeof crossOrigin !== 'undefined') {
      image.crossOrigin = crossOrigin;
    }
    image.onload = async (data) => {
      resolve({
        imageInstance: image,
        data,
        imageType: await getImageType(await transformImageData2ArrayBuffer(image))
      })
    }
    image.src = src;
    image.onerror = reject;
  })
}

export const transformImageData2ArrayBuffer = (image: HTMLImageElement) => {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  ctx?.drawImage(image, 0, 0);

  const dataUrl = canvas.toDataURL();
  const base64Data = dataUrl.split(',')[1];
  const binaryData = atob(base64Data);
  const len = binaryData.length;
  const bytes = new Uint8Array(len);
  
  for (let i = 0; i < len; i++) {
      bytes[i] = binaryData.charCodeAt(i);
  }

  return bytes.buffer;

}

export const getImageBufferFromRemote = (url: string = ''): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';
    xhr.onload = () => {
      resolve(xhr.response);
    };

    xhr.onerror = reject;

    xhr.send();
  })
}
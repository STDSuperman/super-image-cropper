import { IImageData } from '../index'

export type GetArrTypeUnion<T extends any[]> = T extends (infer I)[] ? I : never;

export const getImageData = (src: string = ''): Promise<IImageData> => {
  return new Promise((resolve, reject) => {
    if (!src) resolve({
      width: 0,
      height: 0,
      naturalWidth: 0,
      naturalHeight: 0,
    });
    const image = new Image();
    image.onload = function() {
      const that = this as any;
      resolve({
        width: that.width,
        height: that.height,
        naturalWidth: that.naturalWidth,
        naturalHeight: that.naturalHeight,
      });
    }
    image.onerror = reject;
    image.src = src;
  })
}
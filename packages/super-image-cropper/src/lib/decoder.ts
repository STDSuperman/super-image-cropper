import { parseGIF, decompressFrames, ParsedGif, ParsedFrame } from 'gifuct-js';
import { GetArrTypeUnion } from './helper';

export type IFrames = Pick<ParsedGif, 'frames'>['frames'];
export type IFrame = GetArrTypeUnion<IFrames>;
export interface IParsedFrameInfo {
  frames: ImageData[];
  delays: number[];
  parsedFrames: ParsedFrame[]
}

export class Decoder {
  private parseGIF!: ParsedGif;
  constructor(private url: string) {}

  public async decode(): Promise<ParsedGif> {
    const imageData = await this.fetchImageData(this.url);
    this.parseGIF = parseGIF(imageData);
    this.validateAndFixFrame(this.parseGIF);
    return this.parseGIF;
  }

  public async decompressFrames(): Promise<IParsedFrameInfo> {
    if (!this.parseGIF) await this.decode();
    const parsedFrames = await decompressFrames(this.parseGIF, true);
    const frames = this.generate2ImageData(
      parsedFrames
    );
    // const frames = this.generate2ImageDataWithPixelsModified(
    //   this.handlePixels(parsedFrames),
    //   parsedFrames
    // )

    return {
      frames,
      delays: parsedFrames.map(item => item.delay),
      parsedFrames,
    };
  }

  /**
   * 修复部分帧像素丢失
   * @param gif 
   */
  private validateAndFixFrame = (gif:  any) => {
    let currentGce = null;
    for (const frame of gif.frames) {
      currentGce = frame.gce ? frame.gce : currentGce;
  
      // fix loosing graphic control extension for same frames
      if ("image" in frame && !("gce" in frame)) {
        frame.gce = currentGce;
      }
    }
  };

  /**
   * 包装生成 imageData
   * @param frames 
   */
  private generate2ImageData(
    parsedFrames: ParsedFrame[]
  ): ImageData[] {
    return parsedFrames
      .map((item) => {
        const frameDims = item?.dims;
        const image = new ImageData(frameDims.width, frameDims.height);
        image.data.set(item.patch);
        return image;
      });
  }

  /**
   * 转换被手动填充过样式的帧数据为图片数据
   * @param frames 
   */
  private generate2ImageDataWithPixelsModified(
    frames: Uint8ClampedArray[],
    parsedFrames: ParsedFrame[]
  ): ImageData[] {
    return frames
      .map((item, index) => {
        const frameDims = parsedFrames[index]?.dims;
        const lsd = this.parseGIF.lsd;
        const image = new ImageData(lsd.width, lsd.height);
        image.data.set(new Uint8ClampedArray(item));
        return image;
      });
  }

  /**
   * @param {string} url
   * @returns
   */
  private fetchImageData(url: string) {
    return new Promise<any>((resolve, reject) => {
      const xhr: XMLHttpRequest = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = (e: ProgressEvent<EventTarget>) => {
        if (!(e.target instanceof XMLHttpRequest)) return;

        if (e.target.status !== 200 && e.target.status !== 304) {
          reject('Status Error: ' + e.target.status);
          return;
        }
        let data = e.target.response;
        if (data.toString().indexOf('ArrayBuffer') > 0) {
          data = new Uint8Array(data);
        }
        resolve(data);
      };
      xhr.onerror = e => {
        reject(e);
      };
      xhr.send();
    });
  }

  private handlePixels(frames: ParsedFrame[]) {
    const options = this.parseGIF.lsd;
    const size = options.width * options.height * 4;
    const readyFrames: Uint8ClampedArray[] = [];
    for (let i = 0; i < frames.length; ++i) {
      const frame = frames[i];
      const typedArray =
        i === 0 || frames[i - 1].disposalType === 2
          ? new Uint8ClampedArray(size)
          : readyFrames[i - 1].slice();
      readyFrames.push(this.putPixels(typedArray, frame, options));
    }
    return readyFrames;
  }

  private putPixels(typedArray: Uint8ClampedArray, frame: ParsedFrame, gifSize: ParsedGif['lsd']) {
    // 参考改造项目：https://github.com/Tz-george/webp2gif_demo/blob/master/src/App.vue
    if (!frame.dims) return typedArray;
    const { width, height, top: dy, left: dx } = frame.dims;
    const offset = dy * gifSize.width + dx;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pPos = y * width + x;
        const colorIndex = frame.pixels[pPos];
        const taPos = offset + y * gifSize.width + x;
        const color = frame.colorTable[colorIndex] || [0, 0, 0];
        if (colorIndex === frame.transparentIndex) {
          typedArray[taPos * 4] = 0;
          typedArray[taPos * 4 + 1] = 0;
          typedArray[taPos * 4 + 2] = 0;
          typedArray[taPos * 4 + 3] = 0;
        } else {
          typedArray[taPos * 4] = color[0];
          typedArray[taPos * 4 + 1] = color[1];
          typedArray[taPos * 4 + 2] = color[2];
          typedArray[taPos * 4 + 3] = 255;
        }
      }
    }
    return typedArray;
  }
}
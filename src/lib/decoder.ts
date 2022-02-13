import { parseGIF, decompressFrames, ParsedGif } from 'gifuct-js'
import { GetArrTypeUnion } from './helper'

export type IFrames = Pick<ParsedGif, 'frames'>['frames'];
export type IFrame = GetArrTypeUnion<IFrames>

export class Decoder {
  private parseGIF!: ParsedGif;
  constructor(private url: string) {}

  public async decode(): Promise<ParsedGif> {
    const imageData = await this.fetchImageData(this.url);
    this.parseGIF = parseGIF(imageData);
    return this.parseGIF;
  }

  public async decompressFrames() {
    if (!this.parseGIF) await this.decode();
    return decompressFrames(this.parseGIF, true);
  }

  /**
   * @param {string} url
   * @returns
   */
   private fetchImageData(url: string) {
    return new Promise<any>((resolve, reject) => {
      const xhr: XMLHttpRequest = new XMLHttpRequest()
      xhr.open('GET', url, true)
      xhr.responseType = "arraybuffer";
      xhr.onload = (e: ProgressEvent<EventTarget>) => {
        if (!(e.target instanceof XMLHttpRequest)) return;

        if (e.target.status !== 200 && e.target.status !== 304) {
          reject('Status Error: ' + e.target.status)
          return
        }
        let data = e.target.response
        if (data.toString().indexOf('ArrayBuffer') > 0) {
          data = new Uint8Array(data)
        }
        resolve(data)
      }
      xhr.onerror = (e) => {
        reject(e)
      }
      xhr.send()
    })
  }
}
import { parseGIF, decompressFrames, ParsedGif } from 'gifuct-js'

export type IFrames = Pick<ParsedGif, 'frames'>['frames'];

export class Decoder {
  constructor(private url: string) {}

  public async decode(): Promise<ParsedGif> {
    const imageData = await this.createXhr(this.url);
    return parseGIF(imageData);
  }

  /**
   * Get Gif Data
   *
   * @param {string} url
   * @returns
   */
   private createXhr(url: string) {
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
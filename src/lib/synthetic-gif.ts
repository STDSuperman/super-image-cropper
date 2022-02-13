import { transformToUrl as gifWorkerTransformToUrl } from "gif-build-worker-js";
import GIF from "gif.js";
import { ParsedFrame } from "gifuct-js";

export class SyntheticGIF {
	constructor(private frames: ParsedFrame[]) {}

	public async bootstrap() {
		const gifWorkerUrl = gifWorkerTransformToUrl();
		const gif = new GIF({
			workers: 2,
			quality: 10,
			workerScript: gifWorkerUrl,
		});
		this.frames.forEach((frame) => {});
	}
}

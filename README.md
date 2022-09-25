# Super Image Cropper

Crop GIF / PNG / JPG / JPEG images using Javascript.

![npm](https://img.shields.io/npm/v/super-image-cropper)
![npm](https://img.shields.io/npm/dw/super-image-cropper)
[![GitHub license](https://img.shields.io/github/license/STDSuperman/super-image-cropper)](https://github.com/STDSuperman/super-image-cropper/blob/master/LICENSE)
## Features

- Support for GIF cropping.
- Support for collaboration with cropperjs.
- Support for PNG / JPG / JPEG cropping.


## Experience

- [Online Demo](https://gif-cropper-stdsuperman.vercel.app/)

- CodeSandbox: [Use with cropperjs.](https://codesandbox.io/s/fragrant-field-rxvitm?file=/src/components/pure-cropperjs/index.tsx)

### Preview

#### GIF
<img src="https://blog-images-1257398419.cos.ap-nanjing.myqcloud.com/github/gif-transparent.png" width="657">

#### Static Image

<img src="https://s4.ax1x.com/2022/02/23/bPUoIf.png" width="657">
<!-- [![Static Image](https://s4.ax1x.com/2022/02/23/bPUoIf.png)](https://imgtu.com/i/bPUoIf) -->

## Getting started

### Installation

```shell
npm i super-image-cropper -S
```
or

```shell
yarn add super-image-cropper -S
```

### Usage

Recommend for use with [cropperjs](https://github.com/fengyuanchen/cropperjs).
#### Properties

- `src`: image url.
- `crossOrigin`: set image crossOrigin strategy.
- `cropperInstance`: cropperjs instance.
- `cropperJsOpts`:
  - `x`: the offset left of the cropped area.
  - `y`: the offset top of the cropped area.
  - `width`: the width of the cropped area
  - `height`: the height of the cropped area.
  - `rotate`: the rotated degrees of the image.
  - `scaleX`: the scaling factor to apply on the abscissa of the image.
  - `scaleY`: the scaling factor to apply on the ordinate of the image.
  - `background`: GIF background color.
- `gifJsOptions`: [gif.js](https://github.com/jnordberg/gif.js) options.

#### Working with cropperjs

```html
  <img id="cropperJsRoot" src="xxx.gif"></img>
```

```ts
import { SuperImageCropper, CustomCropper } from 'super-image-cropper';
import Cropper from 'cropperjs';

const image = document.getElementById('image') as HTMLImageElement;
const cropperInstance = new Cropper(image, {
  aspectRatio: 16 / 9,
  autoCrop: false,
  autoCropArea: 1,
  minCropBoxHeight: 10,
  minCropBoxWidth: 10,
  viewMode: 1,
  initialAspectRatio: 1,
  responsive: false,
  guides: true
});

const imageCropper = new SuperImageCropper();

imageCropper.crop({
  cropperInstance: cropperInstance,
  src: 'xxx.gif'
}).then(blobUrl => {
  const img = document.createElement('img');
  img.src = blobUrl;
  document.body.appendChild(img);
});
```

#### Use alone

If not used with cropperjs, the src parameter must be passed.

```ts
import { SuperImageCropper } from 'super-image-cropper';

const imageCropper = new SuperImageCropper();

imageCropper.crop({
  src: gifUrl,
  cropperJsOpts: {
    width: 400,
    height: 240,
    rotate: 45,
    y: 0,
    x: 0,
  }
}).then(blobUrl => {
  const img = document.createElement('img');
  img.src = blobUrl;
  document.body.appendChild(img);
});
```

### Example

- Used with react-cropper or cropperjs in react: [React App](https://github.com/STDSuperman/super-image-cropper/tree/master/example/crop-gif-with-cropper).

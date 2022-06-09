# Super Image Cropper

Crop GIF / PNG / JPG / JPEG images using Javascript.

![npm](https://img.shields.io/npm/v/super-image-cropper)
![npm](https://img.shields.io/npm/dw/super-image-cropper)
[![GitHub license](https://img.shields.io/github/license/STDSuperman/super-image-cropper)](https://github.com/STDSuperman/super-image-cropper/blob/master/LICENSE)
## Features

- [x] Support for GIF cropping.
- [x] Support for collaboration with cropperjs.
- [x] Support for PNG / JPG /JPEG cropping.


## Demo

[Online Demo](https://gif-cropper-stdsuperman.vercel.app/)

### Preview

#### GIF
<img src="[https://s4.ax1x.com/2022/02/23/bPaYwt.png](https://blog-images-1257398419.cos.ap-nanjing.myqcloud.com/github%2Fgif-transparent.png?q-sign-algorithm=sha1&q-ak=AKIDfTacYwRCoJ-kgctpXG1bwojPyiJ-aSCRkD9oJrNVBwJ7yrlr7QRzE5nq7nWTwkna&q-sign-time=1654794331;1654797931&q-key-time=1654794331;1654797931&q-header-list=&q-url-param-list=&q-signature=3c57e2ccb5660d3d1d2b74e3ec6932258d0ab83b&x-cos-security-token=3oM4D54KP7X9DbpVlj36pniS9ErNQCFaa15729165f9407b84ef0d73ba239d54d-a9NL99gufQf4PkP2plEoBW92QUQyf2QET0lxEQ6FHd8ilgdBypfsmdYMyLkkCS-z-HZn4g409HbRm3v1YYCaR3tD0MZFBnPHFPjGbMcLnhF-4R1WsZ4AMkb69ByCVRQ6D_h0dNeHL1MZlWhmo2ReA4yFGG_J2XtUSAr0HPF1-6x8XHwj2FJbfigA2-ZAkZdRzEzDBL4a0Zc4aYdYlgDTA)" width="500">

#### Static Image

<img src="https://s4.ax1x.com/2022/02/23/bPUoIf.png" width="500">
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

Recommend for use with cropper.
#### Properties

- `src`: image url.
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

#### Stand-alone use

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

- Use with react-cropper or cropperjs in react: [React App](https://github.com/STDSuperman/super-image-cropper/tree/master/example/crop-gif-with-cropper).

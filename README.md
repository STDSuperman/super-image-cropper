# Super Image Cropper

[![version](https://img.shields.io/badge/version-1.0.1-yellow.svg)](https://semver.org)

Crop GIF / PNG / JPG / JPEG images using Javascript.

## Features

- [x] Support for GIF cropping.
- [x] Support for collaboration with cropperjs.
- [x] Support for PNG / JPG /JPEG cropping.


## Demo

[Online Demo](https://gif-cropper-stdsuperman.vercel.app/)

### Preview

#### GIF
<img src="https://s4.ax1x.com/2022/02/23/bPaYwt.png" width="500">

#### Static Image

<img src="https://s4.ax1x.com/2022/02/23/bPUoIf.png" width="500">
<!-- [![Static Image](https://s4.ax1x.com/2022/02/23/bPUoIf.png)](https://imgtu.com/i/bPUoIf) -->

## Getting started

### Installation

```shell
npm i super-image-cropper
```


### Usage

```ts
import { SuperImageCropper } from 'super-image-cropper';

const imageCropper = new SuperImageCropper({
  src: gifUrl,
  cropperJsOpts: {
    width: 400,
    height: 240,
    rotate: 45,
    y: 0,
    x: 0,
  }
});

imageCropper.crop().then(blobUrl => {
  const img = document.createElement('img');
  img.src = blobUrl;
  document.body.appendChild(img);
});
```

#### Working With CropperJs

```ts
import { SuperImageCropper, CustomCropper } from 'super-image-cropper';

const imageCropper = new SuperImageCropper({
  cropperInstance: cropperInstance as CustomCropper,
  src: gifUrl
});

imageCropper.crop().then(blobUrl => {
  const img = document.createElement('img');
  img.src = blobUrl;
  document.body.appendChild(img);
});
```

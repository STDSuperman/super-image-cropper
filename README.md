# GIF Cropper

Crop GIF images using Javascript.

## Features

- [x] Support for GIF cropping.
- [x] Support for collaboration with cropperjs.
- [ ] Support for PNG / JPG /JPEG cropping.


## Demo

[Online Demo](https://gif-cropper-stdsuperman.vercel.app/)

### Preview

[![Preview Image](https://s4.ax1x.com/2022/02/20/HOBew4.png)](https://imgtu.com/i/HOBew4)

## Getting started

### Installation

```shell
npm i gif-cropper
```


### Usage

```ts
import { GIFCropper } from 'gif-cropper';

const gifCropper = new GIFCropper({
  src: gifUrl,
  cropperJsOpts: {
    width: 400,
    height: 240,
    rotate: 45,
    y: 0,
    x: 0,
  }
});
gifCropper.crop().then(blobUrl => {
  const img = document.createElement('img');
  img.src = blobUrl;
  document.body.appendChild(img);
});
```

#### Working With CropperJs

```ts
import { GIFCropper, CustomCropper } from 'gif-cropper';

const gifCropper = new GIFCropper({
  cropperInstance: cropperInstance as CustomCropper,
  src: gifUrl
});

gifCropper.crop().then(blobUrl => {
  const img = document.createElement('img');
  img.src = blobUrl;
  document.body.appendChild(img);
});
```
import { useState, useEffect, useCallback, useRef } from 'react';
import { SuperImageCropper } from 'super-image-cropper';
import Cropper from 'cropperjs';

function PureCropperJs() {
  const cropperInstanceRef = useRef<Cropper>();
  const [targetGif] = useState(
    '/cat-rain.gif',
    // "/kvy.jpg"
  );
  const [superImageCropperInstance, setSuperImageCropperInstance] = useState<SuperImageCropper>();
  const [croppedImageList, setCroppedImageList] = useState<string[]>([])

  useEffect(() => {
    const image = document.getElementById('cropperJsRoot') as HTMLImageElement;
    if (!image) return;
    const cropperInstance = new Cropper(image, {
      aspectRatio: 20 / 8,
      autoCrop: false,
      autoCropArea: 1,
      minCropBoxHeight: 10,
      minCropBoxWidth: 10,
      viewMode: 1,
      initialAspectRatio: 1,
      responsive: false,
      guides: true,
      restore: true,
      modal: true,
      center: true,
      highlight: true,
    });
    cropperInstanceRef.current = cropperInstance;
    const superImageCropper = new SuperImageCropper();
    setSuperImageCropperInstance(superImageCropper);
  }, []);

  const onCrop = useCallback(
    () => {
      superImageCropperInstance?.crop({
        cropperInstance: cropperInstanceRef.current,
        outputType: 'base64',
        gifJsOptions: {
          // transparent: null,
        },
        // src: targetGif,
        // cropperJsOpts: {
        //   width: 400.323,
        //   height: 240.323,
        //   // rotate: 545,
        //   y: 0,
        //   x: 0,
        // }
      }).then((base64Data) => {
        // console.log(croppedImageList.concat(blobUrl));
        setCroppedImageList(croppedImageList.concat(base64Data as string));
      });
    },
    [croppedImageList, superImageCropperInstance]
  );

  return (
    <div className="App">
      <img id="cropperJsRoot" src={targetGif} style={{
        width: '100%',
        height: '400px'
      }}></img>
      <button onClick={() => onCrop()} className="btn">裁剪</button>
      <div className='image-container'>
        {
          croppedImageList.map(url => {
            return (
              <div className='item' key={url}>
                <img src={url}></img>
              </div>
            )
          })
        }
      </div>
    </div>
  );
}

export default PureCropperJs;

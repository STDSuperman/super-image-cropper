import { useState, useEffect, useCallback, useRef } from 'react';
import { SuperImageCropper, CustomCropper } from 'super-image-cropper';
import Cropper from 'cropperjs';

function PureCropperJs() {
  const cropperInstanceRef = useRef<Cropper>();
  const [targetGif] = useState(
    '/test.gif'
    // "/kvy.jpg"
  );
  const [superImageCropperInstance, setSuperImageCropperInstance] = useState<SuperImageCropper>();
  const [croppedImageList, setCroppedImageList] = useState<string[]>([])

  useEffect(() => {
    const image = document.getElementById('cropperJsRoot') as HTMLImageElement;
    if (!image) return;
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
    cropperInstanceRef.current = cropperInstance;
    (window as any).cropperInstance = cropperInstance;
    const superImageCropper = new SuperImageCropper();
    setSuperImageCropperInstance(superImageCropper);
  }, []);

  const onCrop = useCallback(
    () => {
      superImageCropperInstance?.crop({
        cropperInstance: cropperInstanceRef.current as CustomCropper,
        src: targetGif,
        // cropperJsOpts: {
        //   width: 400,
        //   height: 240,
        //   rotate: 545,
        //   y: 0,
        //   x: 0,
        // }
      }).then(blobUrl => {
        // console.log(croppedImageList.concat(blobUrl));
        setCroppedImageList(croppedImageList.concat(blobUrl));
      });
    },
    [croppedImageList, superImageCropperInstance]
  );

  return (
    <div className="App">
      <img id="cropperJsRoot" src={targetGif}></img>
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

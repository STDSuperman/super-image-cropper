import { useState, useEffect, useCallback, useRef } from 'react';
import Crop from 'react-cropper';
import { SuperImageCropper, CustomCropper } from 'super-image-cropper';
import Cropper from 'cropperjs';

function ReactCropperjs() {
  const cropperInstanceRef = useRef<Cropper>();
  const [targetGif] = useState(
    '/test.gif'
    // "/kvy.jpg"
  );
  const [gifCropperInstance, setGifCropperInstance] = useState<SuperImageCropper>();
  const [croppedImageList, setCroppedImageList] = useState<string[]>([])

  useEffect(() => {
    const cropperInstance = cropperInstanceRef.current;
    (window as any).cropperInstance = cropperInstance;
    const gifCropper = new SuperImageCropper();
    setGifCropperInstance(gifCropper);
  }, [cropperInstanceRef.current]);

  const onCrop = useCallback(
    () => {
      gifCropperInstance?.crop({
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
    [croppedImageList, gifCropperInstance]
  );

  return (
    <div className="App">
      <Crop
        style={{ height: 500, width: '100%' }}
        initialAspectRatio={1}
        src={targetGif}
        viewMode={1}
        guides={true}
        minCropBoxHeight={10}
        minCropBoxWidth={10}
        background={false}
        responsive={false}
        autoCropArea={1}
        checkOrientation={false}
        // crop={() => onCrop()}
        onInitialized={instance => {
          cropperInstanceRef.current = instance;
        }}
      />
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

export default ReactCropperjs;

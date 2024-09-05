import { useState, useEffect, useCallback, useRef } from 'react';
import Crop from 'react-cropper';
import { SuperImageCropper } from 'super-image-cropper';
import Cropper from 'cropperjs';

const imgList = [
  '/dog.gif',
  '/kvy.jpg',
  '/black_cat.gif',
  '/UDy2.gif',
  '/cat-rain.gif',
  '/test.gif'  
]

let activeImageIndex = 0;

function ReactCropperjs() {
  const cropperInstanceRef = useRef<Cropper>();
  const [sourceImage, setSourceImage] = useState(imgList[0]);
  const [superImageCropperInstance, setSuperImageCropperInstance] = useState<SuperImageCropper>();
  const [croppedImageList, setCroppedImageList] = useState<string[]>([])

  useEffect(() => {
    const superImageCropper = new SuperImageCropper();
    setSuperImageCropperInstance(superImageCropper);
  }, [cropperInstanceRef.current]);

  const onCrop = useCallback(
    () => {
      superImageCropperInstance?.crop({
        // cropperInstance: cropperInstanceRef.current,
        src: sourceImage,
        cropperJsOpts: {
          // background: "#000",
          x: 100,
          y: 100,
          width: 530,
          height: 530,
          // rotate: 240
        },
        gifJsOptions: {
          // transparent: null
        },
        outputType: 'blobURL'
      }).then((blob) => {
        setCroppedImageList(croppedImageList.concat(blob as string));
        console.log('result:', blob);
      });
    },
    [croppedImageList, superImageCropperInstance, sourceImage]
  );

  return (
    <div className="App">
      <Crop
        style={{ height: 500, width: '100%' }}
        initialAspectRatio={1}
        src={sourceImage}
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
      <div>Custom Image Url: <input onInput={(e: any) => setSourceImage(e.target.value)} className="image-input" /></div>
      <button onClick={() => onCrop()} className="btn">裁剪</button>
      <button onClick={() => {
        if (activeImageIndex >= imgList.length - 1) {
          activeImageIndex = 0;
        } else {
          activeImageIndex += 1;
        }
        setSourceImage(imgList[activeImageIndex]);
      }} className="btn-change">换图</button>
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

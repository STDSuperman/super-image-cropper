import { useState, useEffect, useCallback, useRef } from 'react';
import Crop from 'react-cropper';
import { SuperImageCropper } from '../../../../../packages/super-image-cropper';
import Cropper from 'cropperjs';

const imgList = [
  '/black_cat.gif',
  '/dog.gif',
  '/kvy.jpg',
  '/UDy2.gif',
  // '/test.gif'  
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
        cropperInstance: cropperInstanceRef.current,
        src: sourceImage,
        cropperJsOpts: {
          background: "#000",
        },
        gifJsOptions: {
          // transparent: null
        },
        // eslint-disable-next-line
        outputType: 'blobURL'
      }).then((blobUrl) => {
        setCroppedImageList(croppedImageList.concat(blobUrl as any));
        console.log('blobUrl', blobUrl);
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

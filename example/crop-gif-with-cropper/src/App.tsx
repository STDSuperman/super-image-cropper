import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import Crop from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { GIFCropper, CustomCropper } from 'gif-cropper';
import Cropper from 'cropperjs';

function App() {
  const cropperInstanceRef = useRef<Cropper>();
  const [targetGif] = useState('http://img.soogif.com/pGyqIgTKa0Q6AgwVqz4fmNu45wdM7wNC.gif_s400x0');
  const [gifCropperInstance, setGifCropperInstance] = useState<GIFCropper>();
  const isCroppedRef = useRef(false);

  const onCrop = useCallback(
    (isManual = false) => {
      const cropperInstance = cropperInstanceRef.current;
      if (cropperInstance && (!isCroppedRef.current || isManual)) {
        isCroppedRef.current = true;
        console.log(cropperInstance);
        const gifCropper = new GIFCropper({
          // cropperInstance: cropperInstance as CustomCropper,
          src: targetGif,
          cropperJsOpts: {
            width: 200,
            height: 200
          }
        });
        setGifCropperInstance(gifCropper);
        gifCropper.crop().then(blobUrl => {
          const img = document.createElement('img');
          img.src = blobUrl;
          document.body.appendChild(img);
        });
      }
    },
    [cropperInstanceRef.current, isCroppedRef.current]
  );

  useEffect(() => {
    if (cropperInstanceRef.current) {
      cropperInstanceRef.current.crop();
    }
  }, [cropperInstanceRef.current]);

  return (
    <div className="App">
      <Crop
        style={{ height: 400, width: '100%' }}
        initialAspectRatio={1}
        src={targetGif}
        viewMode={1}
        guides={true}
        minCropBoxHeight={10}
        minCropBoxWidth={10}
        background={false}
        responsive={true}
        autoCropArea={1}
        checkOrientation={false}
        crop={() => onCrop()}
        onInitialized={instance => {
          cropperInstanceRef.current = instance;
        }}
      />
      <button onClick={() => onCrop(true)}>裁剪</button>
    </div>
  );
}

export default App;

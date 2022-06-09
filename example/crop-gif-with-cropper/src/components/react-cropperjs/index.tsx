import { useState, useEffect, useCallback, useRef } from 'react';
import Crop from 'react-cropper';
import { SuperImageCropper, CustomCropper } from 'super-image-cropper';
import Cropper from 'cropperjs';

function ReactCropperjs() {
  const cropperInstanceRef = useRef<Cropper>();
  const [targetGif] = useState(
    '/dog.gif'
    // "/kvy.jpg"
  );
  const [superImageCropperInstance, setSuperImageCropperInstance] = useState<SuperImageCropper>();
  const [croppedImageList, setCroppedImageList] = useState<string[]>([])

  useEffect(() => {
    const cropperInstance = cropperInstanceRef.current;
    (window as any).cropperInstance = cropperInstance;
    const gifCropper = new SuperImageCropper();
    setSuperImageCropperInstance(gifCropper);
  }, [cropperInstanceRef.current]);

  const onCrop = useCallback(
    () => {
      superImageCropperInstance?.crop({
        cropperInstance: cropperInstanceRef.current,
        src: targetGif,
        cropperJsOpts: {
          // background: "#fff",
        },
        gifJsOptions: {
          // background: "#000",
          // transparent: null
        }
      }).then((blobUrl: string) => {
        // console.log(croppedImageList.concat(blobUrl));
        setCroppedImageList(croppedImageList.concat(blobUrl));
      });
    },
    [croppedImageList, superImageCropperInstance]
  );

  useEffect(() => {
    const testCanvas = document.getElementById('testCanvas') as HTMLCanvasElement;
    const ctx = testCanvas.getContext('2d');
    const image = new Image();
    image.onload = function(data) {
      ctx?.drawImage(image, 0, 0, 200, 200);
      const data1 = testCanvas.toDataURL();
      const imgData = ctx?.createImageData(300, 300);
      for (let i = 0; i < 1000; i++) {
        const pos = i * 4;
        (imgData as any)[pos] = 0;;
        (imgData as any)[pos + 1] = 224;
        (imgData as any)[pos + 2] = 232;
        (imgData as any)[pos + 3] = 222;
      }
      ctx?.putImageData(imgData as any, 0, 0);
      const img = document.createElement('img');
      img.src = data1 as unknown as string;
      document.body.appendChild(img);
    }
    image.src = '/dog.gif';
  }, []);

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
      <canvas style={{
        width: '500px',
        height: '500px',
        border: '1px solid black',
      }} id='testCanvas'></canvas>
    </div>
  );
}

export default ReactCropperjs;

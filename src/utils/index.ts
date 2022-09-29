
export const renderImageData2Canvas = (imageData: ImageData) => {
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  const targetCanvas = document.createElement('canvas');
  const targetCtx = targetCanvas.getContext('2d');

  document.body.appendChild(targetCanvas);

  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;

  tempCtx?.putImageData(imageData, 0, 0);
  targetCtx?.drawImage(
    tempCanvas,
    0,
    0
  );
}
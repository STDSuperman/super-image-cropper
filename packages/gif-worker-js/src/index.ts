import worker from './lib/gif.worker.js';

export const transformToUrl = (): string => {
  const gifWorker2Blob = new Blob([GifWorker], {
    type: 'application/javascript'
  });
  const workerScript = URL.createObjectURL(gifWorker2Blob);
  return workerScript;
};

export const GifWorker = worker;

import * as Common from '../common/common.js';

console.log('Upload module loaded');

export const myUpload = (event: any):void => {
  console.log('myUpload called');
  console.assert(event != null && event != undefined);
  const xhr = new XMLHttpRequest();
  const formElement = document.getElementById('uploadForm') as HTMLFormElement;
  xhr.open(formElement.method, formElement.action);// True for async which is default
  const uploadStatus = new Common.UploadStatus();
  xhr.upload.onprogress = (e) => reportProgress(uploadStatus, e);
  xhr.upload.onloadstart = () => setUploadStatus('Upload started');
  xhr.upload.onloadend = () => setUploadStatus('Upload done');
  xhr.upload.onerror = () => setUploadStatus('Upload error');
  xhr.upload.onabort = () => setUploadStatus('Upload abort');
  xhr.upload.ontimeout = () => setUploadStatus('Upload timeout');

  xhr.onreadystatechange = () => {
    // NOTE: may be redundant?
    if (xhr.readyState === XMLHttpRequest.DONE) {
      // The other values are: OPENED, HEADERS_RECEIVED, LOADING
      const uploadStatusDiv = document.getElementById('uploadStatus') as HTMLElement;
      if (xhr.status === 200) {
        console.log('Upload complete');
        uploadStatusDiv.innerHTML = 'Upload complete';
      } else {
        console.log('Upload error');
        uploadStatusDiv.innerHTML = 'Upload error';
      }
    } else {
      console.log('readyState:' + xhr.readyState);
      console.log('Status:' + xhr.status);
    }
  };

  xhr.send(new FormData(formElement));
  event.preventDefault();
};

const reportProgress = (uploadStatus: any, e: any): void => {
  const message = e.lengthComputable ?
    `${uploadStatus.getProgressString(e.loaded, e.total)} uploaded` : 'Upload started';
  console.log(message);
  setUploadProgress(message);
};

const setUploadProgress = (s: any): void => {
  (document.getElementById('uploadProgress') as HTMLElement).innerText = s;
};

const setUploadStatus = (s: any): void => {
  (document.getElementById('uploadStatus') as HTMLElement).innerText = s;
};

const formElement = document.getElementById('uploadForm') as HTMLFormElement;
formElement.addEventListener('submit', (event) => myUpload(event));

declare global {
  interface Window { upload_module: Record<string, unknown>; }
}
window.upload_module = {};
window.upload_module.myUpload = myUpload;

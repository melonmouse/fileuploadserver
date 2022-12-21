import * as Common from '../common/common.js';

console.log('Upload module loaded');

export const submitUploadForm = (event: SubmitEvent):void => {
  console.log('Submitting upload form.');
  const xhr = new XMLHttpRequest();
  const formElement = document.getElementById('uploadForm') as HTMLFormElement;
  xhr.open(formElement.method, formElement.action);// True for async which is default
  const uploadStatus = new Common.UploadStatus();
  xhr.upload.onprogress = (e) => reportProgress(uploadStatus, e);
  xhr.upload.onloadstart = () => setUploadStatus('Upload started');
  //xhr.upload.onloadend = () => setUploadStatus('Upload ended');
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

const reportProgress = (uploadStatus: Common.UploadStatus, e: ProgressEvent): void => {
  let percentage = 0;
  if (e.lengthComputable) {
    uploadStatus.printProgressIfChanged(e.loaded, e.total);
    percentage = e.loaded / e.total * 100;
  }
  const message = e.lengthComputable ?
    `${uploadStatus.getProgressString(e.loaded, e.total)} uploaded` : 'Upload started';
  setUploadProgress(message, percentage);
};

const setUploadProgress = (message: string, percentage: number): void => {
  const progressElement = document.getElementById('myProgress') as HTMLElement;
  (progressElement.getElementsByClassName('uploadProgressText')[0] as HTMLElement).innerText = message;
  (progressElement.getElementsByClassName('uploadProgressBar')[0] as HTMLElement).style.width = `${percentage}%`;
};

const setUploadStatus = (message: string): void => {
  (document.getElementById('uploadStatus') as HTMLElement).innerText = message;
};

const formElement = document.getElementById('uploadForm') as HTMLFormElement;
formElement.addEventListener('submit', (event) => submitUploadForm(event));

declare global {
  interface Window { upload_module: Record<string, unknown>; }
}
window.upload_module = {};
window.upload_module.myUpload = submitUploadForm;
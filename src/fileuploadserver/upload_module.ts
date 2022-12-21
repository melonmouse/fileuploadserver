import * as Common from '../common/common.js';

console.log('Upload module loaded');

// TODO check + report if connection is silently lost
// TODO add connection indicator (e.g. circle that rotates when uploading)
// TODO add tests

let lastPercentage = 0;
let xhr:XMLHttpRequest|null = null;

export const submitUploadForm = (event: SubmitEvent):void => {
  lastPercentage = 0;
  progressElement.style.visibility = 'visible';
  console.log('Submitting upload form.');
  xhr = new XMLHttpRequest();
  const formElement = document.getElementById('uploadForm') as HTMLFormElement;
  xhr.open(formElement.method, formElement.action);// True for async which is default
  const uploadStatus = new Common.UploadStatus();
  xhr.upload.onprogress = (e) => reportProgress(uploadStatus, e);
  xhr.upload.onerror = () => setUploadStatus('Upload error');
  xhr.upload.onabort = () => setUploadStatus('Upload abort');
  xhr.upload.ontimeout = () => setUploadStatus('Upload timeout (try again)');
  xhr.upload.onloadend = () => console.log('xhr.upload.onloadend was called');

  xhr.onreadystatechange = () => {
    console.assert(xhr != null);
    if (xhr == null) return;
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        setUploadStatus('Upload successful!');
      } else {
        setUploadStatus(`Upload error [${xhr.status}]: ${xhr.responseText}`);
      }
    }
    console.log(`xhr.readyState=[${xhr.readyState}] xhr.status=[${xhr.status}]`);
    console.log(`xhr.responseText=[${xhr.responseText}]`);
  };

  xhr.send(new FormData(formElement));
  event.preventDefault();
};

const reportProgress = (uploadStatus: Common.UploadStatus, e: ProgressEvent): void => {
  console.assert(xhr != null);
  if (xhr == null) return;
  let percentage = 0;
  if (e.lengthComputable) {
    uploadStatus.printProgressIfChanged(e.loaded, e.total);
    percentage = e.loaded / e.total * 100;
    if (e.total > Common.maxFileSize) {
      xhr.abort();
      setUploadStatus('File too large!');
      return;
    }
  }
  const message = e.lengthComputable ?
    `${uploadStatus.getProgressString(e.loaded, e.total)} uploaded` : 'Upload started';
  setUploadProgress(message, percentage);
};

const progressElement = document.getElementById('myProgress') as HTMLElement;
const textElements = progressElement.getElementsByClassName('uploadProgressText');
console.assert(textElements.length == 1);
const textElement = textElements[0] as HTMLElement;
const barElements = progressElement.getElementsByClassName('uploadProgressBar');
console.assert(barElements.length == 1);
const barElement = barElements[0] as HTMLElement;


const setUploadProgress = (message: string, percentage: number): void => {
  const nIncrements = 1000;  // Limit the number of updates to improve performance.
  console.assert(percentage >= 0 && percentage <= 100);
  console.assert(percentage >= lastPercentage);
  if (percentage - lastPercentage < 100 / nIncrements) {
    return;
  }
  textElement.innerText = message;
  barElement.style.width = `${percentage}%`;
  lastPercentage = percentage;
};

const setUploadStatus = (message: string): void => {
  console.log(`Upload status=[${message}]`);
  textElement.innerText = message;
};

const formElement = document.getElementById('uploadForm') as HTMLFormElement;
formElement.addEventListener('submit', (event) => submitUploadForm(event));

declare global {
  interface Window { upload_module: Record<string, unknown>; }
}
window.upload_module = {};
window.upload_module.myUpload = submitUploadForm;
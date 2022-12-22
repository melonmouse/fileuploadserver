import * as Common from '../common/common.js';

export class Uploader {
  progressElement:HTMLElement;
  textElement:HTMLElement;
  barElement:HTMLElement;

  lastPercentage = 0;
  uploadStatus = new Common.UploadStatus();
  xhr:XMLHttpRequest|null = null;

  constructor(progressElementId:string) {
    this.progressElement =
      document.getElementById(progressElementId) as HTMLElement;
    const textElements =
      this.progressElement.getElementsByClassName('uploadProgressText');
    console.assert(textElements.length == 1);
    this.textElement = textElements[0] as HTMLElement;
    const barElements =
      this.progressElement.getElementsByClassName('uploadProgressBar');
    console.assert(barElements.length == 1);
    this.barElement = barElements[0] as HTMLElement;
  }

  SubmitUpload = (event: SubmitEvent):void => {
    this.lastPercentage = 0;
    this.progressElement.style.visibility = 'visible';
    console.log('Submitting upload form.');
    this.xhr = new XMLHttpRequest();
    const formElement = document.getElementById('uploadForm') as HTMLFormElement;
    this.xhr.open(formElement.method, formElement.action);
    this.xhr.upload.onprogress = (e) => this.reportProgress(e);
    this.xhr.upload.onerror = () => this.setUploadStatus('Upload error');
    this.xhr.upload.onabort = () => this.setUploadStatus('Upload abort');
    this.xhr.upload.ontimeout = () => this.setUploadStatus('Upload timeout (try again)');
    this.xhr.upload.onloadend = () => console.log('xhr.upload.onloadend was called');

    this.xhr.onreadystatechange = () => {
      console.assert(this.xhr != null);
      if (this.xhr == null) return;
      if (this.xhr.readyState === XMLHttpRequest.DONE) {
        if (this.xhr.status === 200) {
          this.setUploadStatus('Upload successful!');
        } else {
          this.setUploadStatus(`Upload error [${this.xhr.status}]: ${this.xhr.responseText}`);
        }
      }
      console.log(`xhr.readyState=[${this.xhr.readyState}] xhr.status=[${this.xhr.status}]`);
      console.log(`xhr.responseText=[${this.xhr.responseText}]`);
    };

    this.xhr.send(new FormData(formElement));
    event.preventDefault();
  }

  reportProgress = (e: ProgressEvent): void => {
    console.assert(this.xhr != null);
    if (this.xhr == null) return;
    let percentage = 0;
    if (e.lengthComputable) {
      this.uploadStatus.printProgressIfChanged(e.loaded, e.total);
      percentage = e.loaded / e.total * 100;
      if (e.total > Common.maxFileSize) {
        this.xhr.abort();
        this.setUploadStatus('File too large!');
        return;
      }
    }
    const message = e.lengthComputable ?
      `${this.uploadStatus.getProgressString(e.loaded, e.total)} uploaded` : 'Upload started';
    this.setUploadProgress(message, percentage);
  };

  setUploadProgress = (message: string, percentage: number): void => {
    const nIncrements = 1000;  // Limit the number of updates to improve performance.
    console.assert(percentage >= 0 && percentage <= 100);
    console.assert(percentage >= this.lastPercentage);
    if (percentage - this.lastPercentage < 100 / nIncrements) {
      return;
    }
    this.textElement.innerText = message;
    this.barElement.style.width = `${percentage}%`;
    this.lastPercentage = percentage;
  };

  setUploadStatus = (message: string): void => {
    console.log(`Upload status=[${message}]`);
    this.textElement.innerText = message;
  };
}

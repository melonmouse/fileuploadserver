import * as Common from '../../common/src/common.js';
import { Utils } from './utils';

// TODO check + report if connection is silently lost
// TODO add connection indicator (e.g. circle that rotates when uploading)
// TODO add tests

export class Uploader {
  formElement:HTMLFormElement;

  progressElement:HTMLElement;
  textElement:HTMLElement;
  barElement:HTMLElement;

  lastPercentage = 0;
  uploadStatus = new Common.UploadStatus();
  xhr:XMLHttpRequest|null = null;

  constructor(formElement:HTMLFormElement, progressElement:HTMLElement) {
    this.formElement = formElement;
    this.progressElement = progressElement;
    this.textElement =
      Utils.getUniqueChildByClassName(this.progressElement, 'uploadProgressText');
    this.barElement =
      Utils.getUniqueChildByClassName(this.progressElement, 'uploadProgressBar');
  }

  SubmitUpload = (event: SubmitEvent): void => {
    this.lastPercentage = 0;
    this.progressElement.style.visibility = 'visible';
    console.log('Submitting upload form.');
    this.xhr = new XMLHttpRequest();
    this.xhr.open(this.formElement.method, this.formElement.action);
    this.xhr.upload.onprogress = (e) => this.reportProgress(e);
    this.xhr.upload.onerror = () => this.setUploadStatus('Upload error');
    this.xhr.upload.onabort = () => this.setUploadStatus('Upload abort');
    this.xhr.upload.ontimeout =
      () => this.setUploadStatus('Upload timeout (try again)');
    this.xhr.upload.onloadend =
      () => console.log('xhr.upload.onloadend was called');

    this.xhr.onreadystatechange = () => {
      console.assert(this.xhr != null);
      if (this.xhr == null) return;
      if (this.xhr.readyState === XMLHttpRequest.DONE) {
        if (this.xhr.status === 200) {
          this.setUploadStatus('Upload successful!');
        } else {
          this.setUploadStatus(
            `Upload error [${this.xhr.status}]: ${this.xhr.responseText}`);
        }
      }
      console.log(
        `xhr.readyState=[${this.xhr.readyState}] xhr.status=[${this.xhr.status}]`);
      console.log(`xhr.responseText=[${this.xhr.responseText}]`);
    };

    this.xhr.send(new FormData(this.formElement));
    event.preventDefault();
  };

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
    let message = 'Upload started';
    if (e.lengthComputable) {
      message =
        `${this.uploadStatus.getProgressString(e.loaded, e.total)} uploaded`;
    }
    this.setUploadProgress(message, percentage);
  };

  setUploadProgress = (message: string, percentage: number): void => {
    const nIncrements = 1000;  
    console.assert(percentage >= 0 && percentage <= 100);
    console.assert(percentage >= this.lastPercentage);
    if (percentage - this.lastPercentage < 100 / nIncrements) {
      // Updates the progress bar at most nIncrements times (for better performance).
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

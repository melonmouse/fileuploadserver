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

  lastPercentage:number;
  lastNBytes:number;
  lastProgressTimeMillis:number;
  connectionCheckTimer: NodeJS.Timer;

  hasUpload = false;

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

  submitUpload = (event: SubmitEvent): void => {
    console.assert(!this.hasUpload);

    this.hasUpload = true;
    this.lastPercentage = 0;
    this.lastNBytes = 0;

    this.lastProgressTimeMillis = Date.now();
    this.progressElement.style.visibility = 'visible';
    console.log('Submitting upload form.');
    this.xhr = new XMLHttpRequest();
    this.xhr.open(this.formElement.method, this.formElement.action);
    this.xhr.upload.onprogress = (e) => this._reportProgress(e);
    this.xhr.upload.onerror = () => this._stopUpload('Upload error');
    this.xhr.upload.onabort = () => this._stopUpload('Upload abort');
    this.xhr.upload.ontimeout =
      () => this._stopUpload('Upload timeout (try again)');
    this.xhr.upload.onloadend =
      () => console.log('xhr.upload.onloadend was called');
    
    this.connectionCheckTimer =
      setInterval(() => this._checkConnectionStatus(), 1000);

    this.xhr.onreadystatechange = this._handleReadyStateChange;
    this.xhr.send(new FormData(this.formElement));
    event.preventDefault();
  };

  _stopUpload = (message: string): void => {
    console.log('_stopUpload is called');
    this._setUploadStatus(message);

    console.assert(this.hasUpload);

    if (this.xhr != null) {
      this.xhr.abort();
    }

    clearInterval(this.connectionCheckTimer);

    this.hasUpload = false;
  };

  _checkConnectionStatus = () => {
    const now = Date.now();
    const secondsWithoutProgress = (now - this.lastProgressTimeMillis) / 1000;
    if (secondsWithoutProgress > 10) {
      this._setUploadStatus(
        `Connection interrupted... [${Math.round(secondsWithoutProgress)}s]`);
    }
    if (secondsWithoutProgress >= 60) {
      this._stopUpload('Upload failed.');
    }
  };

  _handleReadyStateChange = () => {
    console.assert(this.xhr != null);
    if (this.xhr == null) return;
    if (this.xhr.readyState === XMLHttpRequest.DONE) {
      if (this.xhr.status === 200) {
        this._stopUpload('Upload successful!');
      } else {
        this._stopUpload(
          `Upload error [${this.xhr.status}]: ${this.xhr.responseText}`);
      }
    }
    console.log(
      `xhr.readyState=[${this.xhr.readyState}] xhr.status=[${this.xhr.status}]`);
    console.log(`xhr.responseText=[${this.xhr.responseText}]`);
  };

  _reportProgress = (e: ProgressEvent): void => {
    const currentNBytes = e.loaded;
    if (currentNBytes > this.lastNBytes) {
      this.lastProgressTimeMillis = Date.now();
    }
    this.lastNBytes = currentNBytes;
    console.assert(this.xhr != null);
    if (this.xhr == null) return;
    let percentage = 0;
    if (e.lengthComputable) {
      this.uploadStatus.printProgressIfChanged(e.loaded, e.total);
      percentage = e.loaded / e.total * 100;
      if (e.total > Common.maxFileSize) {
        this._stopUpload('File too large!');
        return;
      }
    }
    let message = 'Upload started';
    if (e.lengthComputable) {
      message =
        `${this.uploadStatus.getProgressString(e.loaded, e.total)} uploaded`;
    }
    this._setUploadProgress(message, percentage);
  };

  _setUploadProgress = (message: string, percentage: number): void => {
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

  _setUploadStatus = (message: string): void => {
    console.log(`Upload status=[${message}]`);
    this.textElement.innerText = message;
  };
}

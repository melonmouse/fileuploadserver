import { Uploader } from './upload_class';

console.log('Upload module loaded');

// TODO check + report if connection is silently lost
// TODO add connection indicator (e.g. circle that rotates when uploading)
// TODO add tests

export const submitUploadForm = (event: SubmitEvent):void => {
  new Uploader('myProgress').SubmitUpload(event);
};

const formElement = document.getElementById('uploadForm') as HTMLFormElement;
formElement.addEventListener('submit', (event) => submitUploadForm(event));

declare global {
  interface Window { upload_module: Record<string, unknown>; }
}
window.upload_module = {};
window.upload_module.myUpload = submitUploadForm;
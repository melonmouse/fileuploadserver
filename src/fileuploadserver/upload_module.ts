import { Uploader } from './upload_class';
import { Utils } from './utils';

const createUploadForm = (uploadModuleElementId:string): void => {
  const uploadModuleElement =
    document.getElementById(uploadModuleElementId) as HTMLElement;
  const formElement = Utils.getUniqueChildByClassName(
    uploadModuleElement, 'uploadForm') as HTMLFormElement;
  const progressElement =
    Utils.getUniqueChildByClassName(uploadModuleElement, 'uploadProgress');

  const uploader = new Uploader(formElement, progressElement);

  const submitUploadForm = (event: SubmitEvent): void => {
    uploader.SubmitUpload(event);
  };

  formElement.addEventListener('submit', submitUploadForm);

  // Expose uploaders to the global scope for debugging.
  console.log(`Upload form [${uploadModuleElementId}] loaded.`);
  window.uploadModule[uploadModuleElementId] = submitUploadForm;
};

declare global {
  interface Window { uploadModule: Record<string, unknown>; }
}
window.uploadModule = {};

createUploadForm('myUploadForm');
import { Uploader } from './upload_class';
import { Utils } from './utils';

const createUploadForm = async (uploadModuleElement:HTMLElement): Promise<void> => {
  console.log(`Fetching upload form [${uploadModuleElement.id}].`);
  await Utils.loadHtml('./static/upload_module.html', uploadModuleElement);
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
  console.log(`Upload form [${uploadModuleElement.id}] is ready.`);
  window.uploadModule[uploadModuleElement.id] = submitUploadForm;
};

declare global {
  interface Window { uploadModule: Record<string, unknown>; }
}
window.uploadModule = {};

for (const uploadModuleElement of document.getElementsByClassName('uploadWidget')) {
  createUploadForm(uploadModuleElement as HTMLElement);
}
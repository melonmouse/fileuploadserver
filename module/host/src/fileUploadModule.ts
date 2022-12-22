import path from 'path';
import sanitize from 'sanitize-filename';
import { NextFunction, Request, Response } from 'express';
import formidable from 'formidable';

import * as Common from '../../common/src/common.js';
import IncomingForm from 'formidable/Formidable.js';

export class FileUploadModule {
  uploadDir: string;

  constructor(uploadDir:string) {
    this.uploadDir = uploadDir;
  }
 
  doUpload = (req: Request, res: Response, next: NextFunction) => {
    const date = new Date();
    const hexIdLength = 4;
    const randomHexString = Math.floor(Math.random() * 16 ** hexIdLength).toString(16).padStart(hexIdLength, '0');
    const uploadId = `${req.ip}_${randomHexString}`;
    const filenamePrefix = `${date.toISOString()}_${randomHexString}`;

    const printToConsole = (message: string):void => {
      const currentTime = new Date().toISOString().substring(5);
      console.log(`\x1b[34m${currentTime} | ${uploadId} | \x1b[0m${message}`);
    };

    const generateFilename = (_name: string, _ext: string, part: formidable.Part,
      _form: IncomingForm): string => {
      const originalPath = part.originalFilename;
      const originalFilename = sanitize(path.basename(originalPath));
      const newFilename = `${filenamePrefix}_${originalFilename}.upload`;
      return sanitize(newFilename);
    };

    const form = formidable({
      multiples: true,
      uploadDir: this.uploadDir,
      filename: generateFilename,
      maxFileSize: Common.maxFileSize,
      hashAlgorithm: 'SHA1',
    });
    
    const uploadStatus = new Common.UploadStatus();
    form.on('field', (name, value) => printToConsole(
      `Received field: [${name}]=[${value}].`));
    form.on('fileBegin', (formName, file) => printToConsole(
      `Starting upload: [${file.originalFilename}]=>[${file.newFilename}].`));
    form.on('progress', (bytesReceived, bytesTotal) => uploadStatus.printProgressIfChanged(bytesReceived, bytesTotal, printToConsole));
    form.on('error', (err) => printToConsole(
      `Upload error: httpCode=[${err.httpCode}] code=[${err.code}], message=[${err.message}]`));
    form.on('aborted', () => printToConsole(
      'Upload aborted: timeout or close event on socket.'));
    form.on('end', () => printToConsole('Uploads complete.'));

    form.parse(req, (err, fields:formidable.Fields, files:formidable.Files) => {
      printToConsole(`Parsing form.`);
      if (err) {
        printToConsole(`An error occured: [${err}]`);
        return;
      }
      printToConsole(`Returning json.`);
      res.json({ fields, files });
    });
  };
}
 
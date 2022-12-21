import path from 'path';
import express, { NextFunction, Request, Response } from 'express';
import formidable from 'formidable';
import rateLimit from 'express-rate-limit';
import { ArgumentParser } from 'argparse';

import * as Common from './common/common.js';
import IncomingForm from 'formidable/Formidable.js';

const parser: ArgumentParser = new ArgumentParser({
  description: 'File Upload Server'
});
parser.add_argument('--port', {type: 'int', default: 8080});
parser.add_argument('--ip', {type: String, default: 'localhost'});
const argv = parser.parse_args();

const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  skipSuccessfulRequests: true,  // allow at most 3 failed requests per 10 minutes.
  standardHeaders: false,
  legacyHeaders: false,
  message: 'Too many failed uploads, please try again in 10 minutes.',
  // NOTE: can set a custom requestWasSuccessful function.
  // NOTE: can whitelist specific IPs like this:
  //   skip: (request, response) => ['192.168.0.0'].includes(request.ip),
});

const app:express.Application = express();

const dirname = () => {
  return path.join(process.cwd(), 'dist');
};

//app.use((req:any, res:any, next:any) => {
//  const policy = '\'self\' \'unsafe-inline\'';
//  res.setHeader(
//    'Content-Security-Policy',
//    `media-src ${policy}; script-src ${policy};`
//  );
//  next();
//});

app.use('/static', express.static(path.join(dirname(),'fileuploadserver')));

app.get('/', (req:Request, res:Response) => {
  res.sendFile(path.join(dirname(), 'fileuploadserver/upload_module.html'));
});

app.listen(argv.port, argv.ip, () => {
  console.log(`Server listening on http://${argv.ip}:${argv.port}...`);
});

app.post('/api/upload', uploadLimiter, (req:Request, res:Response, next:NextFunction) => {
  const GIBI = 1024 * 1024 * 1024;
  const date = new Date();
  const filename = `${date.toISOString()}_drone_map.tiff`;

  const form = formidable({
    multiples: true,
    uploadDir: path.join(dirname(), 'uploads'),
    filename: (_name:string, _ext:string, _part:formidable.Part, _form:IncomingForm) => filename,
    maxFileSize: 5 * GIBI,
    hashAlgorithm: 'SHA1',
  });

  const uploadStatus = new Common.UploadStatus();
  form.on('field', (name, value) => console.log(
    `Received field: [${name}]=[${value}].`));
  form.on('fileBegin', (formName, file) => console.log(
    `Starting upload: [${file.originalFilename}]=>[${file.newFilename}].`));
  form.on('progress', uploadStatus.printProgressIfChanged);
  form.on('error', (err) => console.log(
    `Upload error: httpCode=[${err.httpCode}] code=[${err.code}], message=[${err.message}]`));
  form.on('aborted', () => console.log(
    'Upload aborted: timeout or close event on socket.'));
  form.on('end', () => console.log('Uploads complete.'));

  form.parse(req, (err, fields:formidable.Fields, files:formidable.Files) => {
    if (err) {
      next(err);
      return;
    }
    res.json({ fields, files });
  });
});

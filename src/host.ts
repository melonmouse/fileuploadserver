import path from 'path';
import express, { NextFunction, Request, Response } from 'express';
import formidable from 'formidable';
import rateLimit from 'express-rate-limit';
import { ArgumentParser } from 'argparse';

import * as Common from './common/common.js';
import IncomingForm from 'formidable/Formidable.js';

// TODO disambiguate logs (for when multiple uploads happen at once)
// TODO test with slow connections on chrome
// TODO test with safari
// TODO test on mobile (ios, android)
// TODO test on older browsers
// TODO fix that firefox fails when connection is briefly lost

const parser: ArgumentParser = new ArgumentParser({
  description: 'File Upload Server'
});
parser.add_argument('--port', {type: 'int', default: 8080});
parser.add_argument('--ip', {type: String, default: 'localhost'});
const argv = parser.parse_args();

const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
  skipSuccessfulRequests: true,  // allow at most 10 failed requests per 10 minutes.
  standardHeaders: false,
  legacyHeaders: false,
  message: 'Too many failed uploads, please try again in 10 minutes.',
  handler: (request, response, next, options) => {
    response.status(options.statusCode).send(options.message);
    console.log(`Upload rate limit exceeded for ip=[${request.ip}]!`);
    // NOTE: make sure to not log the IP adress longer term.
  },
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
  const date = new Date();
  const filename = `${date.toISOString()}_drone_map.tiff`;
  const hexIdLength = 4;
  const randomHexString = Math.floor(Math.random() * 16 ** hexIdLength).toString(16).padStart(hexIdLength, '0');
  const uploadId = `${req.ip} ${randomHexString}`;

  const printToConsole = (message: string):void => {
    const currentTime = new Date().toISOString().substring(5);
    console.log(`\x1b[34m${currentTime} | ${uploadId} | \x1b[0m${message}`);
  };

  const form = formidable({
    multiples: true,
    uploadDir: path.join(dirname(), 'uploads'),
    filename: (_name:string, _ext:string, _part:formidable.Part, _form:IncomingForm) => filename,
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
    if (err) {
      next(err);
      return;
    }
    res.json({ fields, files });
  });
});

import path from 'path';
import express from 'express';
import formidable from 'formidable';
import rateLimit from 'express-rate-limit';
import { ArgumentParser } from 'argparse';

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

class UploadStatus {
  lastReceivedInUnit = NaN;
  
  printProgress = (bytesReceived:number, bytesExpected:number):void => {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const unitIndex = Math.floor(Math.log10(bytesExpected) / 3);
    const unitName = units[unitIndex];
    const unitSize = Math.pow(1000, unitIndex);
    const receivedInUnit = Math.round(bytesReceived / unitSize * 10) / 10;
    if (isNaN(this.lastReceivedInUnit) ||
      receivedInUnit > this.lastReceivedInUnit) {
      this.lastReceivedInUnit = receivedInUnit;
      const expectedInUnit = Math.round(bytesExpected / unitSize * 10) / 10;
      console.log(`Progress: ${receivedInUnit} / ${expectedInUnit} ${unitName}`);
    }
  }
}

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

app.get('/', (req:any, res:any) => {
  res.sendFile(path.join(dirname(), 'fileuploadserver/upload_module.html'));
});

app.listen(argv.port, argv.ip, () => {
  console.log(`Server listening on http://${argv.ip}:${argv.port}...`);
});

app.post('/api/upload', uploadLimiter, (req:any, res:any, next:any) => {
  const GIBI = 1024 * 1024 * 1024;
  const date = new Date();
  const filename = `${date.toISOString()}_drone_map.tiff`;

  const form = formidable({
    multiples: true,
    uploadDir: path.join(dirname(), 'uploads'),
    filename: (_name:any, _ext:any, _part:any, _form:any) => filename,
    maxFileSize: 5 * GIBI,
    hashAlgorithm: 'SHA1',
  });

  const uploadStatus = new UploadStatus();
  form.on('field', (name, value) => console.log(
    `Received field: [${name}]=[${value}].`));
  form.on('fileBegin', (formName, file) => console.log(
    `Starting upload: [${file.originalFilename}]=>[${file.newFilename}].`));
  form.on('progress', uploadStatus.printProgress);
  form.on('error', (err) => console.log(
    `Upload error: httpCode=[${err.httpCode}] code=[${err.code}], message=[${err.message}]`));
  form.on('aborted', () => console.log(
    'Upload aborted: timeout or close event on socket.'));
  form.on('end', () => console.log('Uploads complete.'));

  form.parse(req, (err:any, fields:any, files:any) => {
    if (err) {
      next(err);
      return;
    }
    res.json({ fields, files });
  });
});
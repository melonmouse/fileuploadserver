import express from 'express';
import formidable from 'formidable';
import rateLimit from 'express-rate-limit';
import argparse from 'argparse';

const parser = new argparse.ArgumentParser({});
parser.add_argument('--port', {type: 'int', default: 8080});
parser.add_argument('--ip', {type: 'string', default: 'localhost'});
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
  return process.cwd() + '/dist';
};

app.get('/', (req:any, res:any) => {
  res.sendFile(dirname() + '/fileuploadserver/upload_module.html');
});

app.listen(argv.port, argv.ip, () => {
  console.log(`Server listening on http://${argv.ip}:${argv.port}...`);
});

app.post('/api/upload', uploadLimiter, (req:any, res:any, next:any) => {
  const GIBI = 1024 * 1024 * 1024;
  const date = new Date();
  console.log(`${date.toISOString()}_drone_map.tiff`);

  const form = formidable({
    multiples: true,
    uploadDir: dirname() + '/uploads',
    filename: (_name:any, _ext:any, _part:any, _form:any) => `${date.toISOString()}_drone_map.tiff`,
    maxFieldsSize: 5 * GIBI,
    hashAlgorithm: 'SHA1',
  });

  form.parse(req, (err:any, fields:any, files:any) => {
    if (err) {
      next(err);
      return;
    }
    res.json({ fields, files });
  });
});

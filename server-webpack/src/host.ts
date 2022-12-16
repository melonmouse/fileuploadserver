import express from 'express';
import formidable from 'formidable';
import rateLimit from 'express-rate-limit';

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

const randomRange = (min: number, max: number):number => {
  console.assert(min < max, 'min must be less than max');
  console.assert(!Number.isNaN(min) && !Number.isNaN(max),
    'min and max must be numbers');
  return min + Math.floor(Math.random() * (max - min));
};

// Select random open port in [1024, 49152[.
const PORT = randomRange(1024, 49152);

const dirname = () => {
  return process.cwd() + '/dist';
};

app.get('/', (req:any, res:any) => {
  res.sendFile(dirname() + '/fileuploadserver/upload_module.html');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}...`);
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

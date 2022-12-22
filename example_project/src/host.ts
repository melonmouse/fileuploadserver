import path from 'path';
import express, { Request, Response } from 'express';
import { ArgumentParser } from 'argparse';
import rateLimit from 'express-rate-limit';
import { FileUploadModule } from '../../module/host/dist/host/src/fileUploadModule.js'; 

const parser: ArgumentParser = new ArgumentParser({
  description: 'File Upload Server'
});
parser.add_argument('--port', {type: 'int', default: 8080});
parser.add_argument('--ip', {type: String, default: 'localhost'});
const argv = parser.parse_args();

const app:express.Application = express();

const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,  // allow at most 10 failed requests per 10 minutes per client.
  skipSuccessfulRequests: true,
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

const fileUploadModule = new FileUploadModule('uploads');

const uploadModuleDir = () => {
  return path.join(process.cwd(), '../../fileuploadserver/module');
};

// Host the required static files for the client
app.use('/fileuploadclient-static', express.static(path.join(uploadModuleDir(),
  'client/dist')));

app.get('/', (req:Request, res:Response) => {
  res.sendFile(path.join(process.cwd(), 'src/client.html'));
});

app.listen(argv.port, argv.ip, () => {
  console.log(`Server listening on http://${argv.ip}:${argv.port}...`);
});

app.post('/api/upload', uploadLimiter, fileUploadModule.doUpload);
//

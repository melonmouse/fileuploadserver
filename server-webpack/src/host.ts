import express from 'express';
import formidable from 'formidable';

const app:express.Application = express();

const PORT = 3000;

const dirname = () => {
  return process.cwd() + '/dist';
};

app.get('/', (req:any, res:any) => {
  res.sendFile(dirname() + '/fileuploadserver/upload_module.html');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}...`);
});

app.post('/api/upload', (req:any, res:any, next:any) => {
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

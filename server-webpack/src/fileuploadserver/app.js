const express = require('express');
const formidable = require('formidable');

const square = require("./square");
const wiki = require("./wiki.js");

const app = express();

const port = 3000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/upload_module.html');
});

app.post('/api/upload', (req, res, next) => {
  const GIBI = 1024 * 1024 * 1024;
  const date = new Date();
  console.log(`${date.toISOString()}_drone_map.tiff`);

  const form = formidable({
    multiples: true,
    uploadDir: __dirname + '/uploads',
    filename: (_name, _ext, _part, _form) => `${date.toISOString()}_drone_map.tiff`,
    maxFieldsSize: 5 * GIBI,
    hashAlgorithm: 'SHA1',
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    res.json({ fields, files });
  });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}...`);
});


app.all("/square", function (req, res, next) {
  //res.send(square.area(req));
  res.send("33");
  next();
  console.log("bla");
});

app.use("/wiki", wiki);




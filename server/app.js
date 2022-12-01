const express = require('express');
const formidable = require('formidable');

const square = require("./square");
const wiki = require("./wiki.js");

const app = express();

const port = 3000;

app.get('/', (req, res) => {
  res.send(`
    <form action="/api/upload" enctype="multipart/form-data" method="post">
      <div>Text field title: <input type="text" name="title" /></div>
      <div>File: <input type="file" name="someExpressFiles" multiple="multiple" /></div>
      <input type="submit" value="Upload" />
    </form>
  `);
});

app.post('/api/upload', (req, res, next) => {
  const form = formidable({ multiples: true });

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




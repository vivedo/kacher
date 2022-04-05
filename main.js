const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('store.sqlite');
const crypto = require('crypto');

if (!fs.existsSync('storage')) fs.mkdirSync('storage');

const server = http.createServer((req, res) => {
  const fileUrl = req.url.substr(1, req.url.length);
  const hash = crypto.createHash('sha256').update(fileUrl).digest('hex');

  db.get('SELECT * FROM files WHERE hash = ?', [hash], (err, row) => {
    if (row) {
      console.log(`Serving cached ${fileUrl}`);

      fs.readFile(path.join(__dirname, 'storage', hash), function (err, data) {
        if (err) {
          res.writeHead(404);
          res.end(JSON.stringify(err));
          return;
        }
        res.writeHead(200, { 'Content-Type': row.mime });
        res.end(data);
      });
    } else {
      console.log(`Downloading and caching ${fileUrl}`);

      const file = fs.createWriteStream(path.join(__dirname, 'storage', hash));

      try {
        const get = fileUrl.indexOf('http://') === 0 ? http.get : https.get;
        const request = get(fileUrl, function (response) {
          response.pipe(file);

          res.writeHead(200);
          response.pipe(res);

          file.on('finish', () => {
            file.close();
            res.end();
            console.log('Download Completed');
            db.run('INSERT INTO files (hash, mime) VALUES (?, ?)', [
              hash,
              response.headers['content-type'],
            ]);
          });
        });
      } catch (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
      }
    }
  });
});

db.run(
  'CREATE TABLE IF NOT EXISTS files (hash TEXT PRIMARY KEY, mime TEXT)',
  () => {
    server.listen(process.env.KACHER_PORT || 8080, () => {
      console.log(`Kacher listening on :${process.env.KACHER_PORT || 8080}`);
    });
  },
);

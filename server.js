const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 3001;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.csv':  'text/csv; charset=utf-8',
};

http.createServer((req, res) => {
  const urlPath   = req.url.split('?')[0];
  const filePath  = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);
  const ext       = path.extname(filePath).toLowerCase();
  const mimeType  = MIME[ext] || 'text/plain; charset=utf-8';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`Static server running at http://localhost:${PORT}`);
});

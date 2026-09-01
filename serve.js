// Petit serveur statique pour tester Kryptos en local.
// Lancement : node serve.js  puis ouvrir http://localhost:8123
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8123;
const RACINE = __dirname;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };

http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') url = '/index.html';
  const fichier = path.join(RACINE, path.normalize(url).replace(/^(\.\.[/\\])+/, ''));
  fs.readFile(fichier, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Introuvable'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(fichier)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(PORT, () => console.log('Kryptos sur http://localhost:' + PORT));

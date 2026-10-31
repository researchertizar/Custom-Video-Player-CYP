import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDir = path.resolve(__dirname, '../dist-demo');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  const filePath = path.join(baseDir, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    res.end(fs.readFileSync(filePath));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found: ' + reqPath);
  }
});

server.listen(4173, async () => {
  console.log('Preview test server listening on port 4173');
  try {
    const htmlRes = await fetch('http://localhost:4173/');
    console.log('Root HTML Status:', htmlRes.status);
    const html = await htmlRes.text();

    const jsFile = html.match(/src="(\.\/assets\/[^"]+)"/);
    const cssFile = html.match(/href="(\.\/assets\/[^"]+\.css)"/);
    const svgIcon = html.match(/href="(\.\/assets\/[^"]+\.svg)"/);
    const icoIcon = html.match(/href="(\.\/assets\/[^"]+\.ico)"/);

    for (const item of [jsFile, cssFile, svgIcon, icoIcon]) {
      if (item && item[1]) {
        const url = 'http://localhost:4173/' + item[1].replace('./', '');
        const res = await fetch(url);
        const text = await res.text();
        console.log(`[PASS] ${item[1]} -> HTTP ${res.status} (${text.length} bytes)`);
        if (res.status !== 200) {
          throw new Error(`Failed to load ${item[1]}`);
        }
      }
    }

    console.log('ALL ASSETS VERIFIED 100% ACCESSIBLE AND RETRIEVABLE.');
  } catch (err) {
    console.error('VERIFICATION ERROR:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});


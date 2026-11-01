import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('Building showcase demo site with Vite...');
execSync('npx vite build --config vite.config.demo.js', { stdio: 'inherit', cwd: rootDir });

const distDemo = path.resolve(rootDir, 'dist-demo');
const demoDir = path.resolve(distDemo, 'demo');

// Ensure /demo/ subdirectory seamlessly redirects to root showcase
if (!fs.existsSync(demoDir)) {
  fs.mkdirSync(demoDir, { recursive: true });
}
const redirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=../">
  <script>window.location.replace('../');</script>
  <title>Custom Video Player (CYP)</title>
</head>
<body style="background:#09090b;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <p>Redirecting to <a href="../" style="color:#e50914;">Custom Video Player Showcase</a>...</p>
</body>
</html>`;
fs.writeFileSync(path.resolve(demoDir, 'index.html'), redirectHtml, 'utf-8');
console.log('Showcase build complete with root index.html and /demo/ fallback.');

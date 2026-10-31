import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('Building showcase demo site with Vite...');
execSync('npx vite build --config vite.config.demo.js', { stdio: 'inherit', cwd: rootDir });

const demoHtml = path.resolve(rootDir, 'dist-demo/demo/index.html');
const rootHtml = path.resolve(rootDir, 'dist-demo/index.html');

if (fs.existsSync(demoHtml)) {
  fs.copyFileSync(demoHtml, rootHtml);
  console.log('Successfully mirrored dist-demo/demo/index.html to dist-demo/index.html');
} else {
  console.warn('Warning: dist-demo/demo/index.html not found.');
}


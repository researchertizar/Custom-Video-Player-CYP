import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'demo',
  base: './',
  build: {
    outDir: resolve(__dirname, 'dist-demo'),
    emptyOutDir: true
  }
});

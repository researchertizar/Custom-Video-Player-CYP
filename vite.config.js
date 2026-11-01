import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/bundle.js'),
      name: 'CustomYouTubePlayer',
      formats: ['es', 'umd'],
      fileName: (format) => `player.${format}.js`
    },
    rollupOptions: {
      output: {
        exports: 'named',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'player.css';
          }
          return assetInfo.name;
        }
      }
    }
  },
  test: {
    environment: 'node'
  }
});

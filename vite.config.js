import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'UI-Buttons': path.resolve(__dirname, './src/components/UI/buttons')
    }
  }
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'https://api.football-data.org/v4',
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace(/^\/api/, '')
  //     }
  //   }
  // }
});
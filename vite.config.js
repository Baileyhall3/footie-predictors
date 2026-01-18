import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        'UI-Buttons': path.resolve(__dirname, './src/components/UI/buttons'),
        'UI': path.resolve(__dirname, './src/components/UI'),
        'UI-Input': path.resolve(__dirname, './src/components/UI/input'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'https://api.football-data.org/v4',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          headers: {
            'X-Auth-Token': env.VITE_API_KEY,
          },
        },
      },
    },
  };
});

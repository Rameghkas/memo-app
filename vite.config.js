import { defineConfig } from 'vite';

export default defineConfig({
  base: '/sagar-app/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});

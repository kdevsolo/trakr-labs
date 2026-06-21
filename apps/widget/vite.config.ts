import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { serveWidgetBundleInDev } from './vite-plugin-serve-bundle';

export default defineConfig({
  plugins: [react(), serveWidgetBundleInDev()],
  root: '.',
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'TrakrWidget',
      formats: ['iife'],
      fileName: () => 'trakr-widget.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    cssCodeSplit: false,
    outDir: 'dist',
    emptyOutDir: true,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  server: {
    open: '/demo.html',
  },
});

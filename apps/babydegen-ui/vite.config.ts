/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/babydegen-ui',
  server: {
    port: 4300,
    host: 'localhost',
  },
  preview: {
    port: 4400,
    host: 'localhost',
  },
  plugins: [react(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
  build: {
    outDir: '../../dist/apps/babydegen-ui',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  define: {
    'process.env': {
      REACT_APP_AGENT_NAME: process.env.REACT_APP_AGENT_NAME,
      IS_MOCK_ENABLED: process.env.IS_MOCK_ENABLED,
    },
  },
}));

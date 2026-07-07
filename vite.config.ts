import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM-safe absolute path to this config's directory. Using fileURLToPath
// is the only approach guaranteed to work across every Node/Vite/OS combo —
// the bare `__dirname` silently resolved to the wrong value on our Linux
// droplet and broke every "@/..." import.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(HERE, 'src');

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    allowedHosts: [
      '.pinggy.link',
      '.pinggy.io',
      '.ngrok-free.app',
      '.ngrok.io',
      'localhost',
      '127.0.0.1',
    ],
    // NOTE: do NOT set `Cache-Control: no-store` here. It disables the browser's
    // module cache for every dev asset, forcing a full re-download + re-parse of
    // the entire source module graph on each reload (slow). Vite already handles
    // cache-busting via content hashes and 304 revalidation.
    hmr: {
      overlay: true,
    },
    proxy: {
      '/api': {
        target: 'https://jparkmain.duckdns.org/',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    // Use the [{ find, replacement }] array form — it's more explicit than
    // the object form and guarantees deterministic matching on all platforms.
    // The regex ensures "@" is only matched as a path prefix (not inside
    // package names like "@scope/foo").
    alias: [
      { find: /^@\/(.*)$/, replacement: `${SRC}/$1` },
      { find: /^@$/, replacement: SRC },
    ],
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mts', '.mjs', '.json'],
  },
  // Do NOT force dep pre-bundling on every start — `force: true` discards the
  // cached optimized deps in node_modules/.vite and re-bundles all dependencies
  // on every `vite` startup, slowing cold start. Vite invalidates this cache
  // automatically when package.json/lockfile change. Run `vite --force` manually
  // for the rare one-off cache bust.
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
        },
      },
    },
  },
});

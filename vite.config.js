import { defineConfig } from 'vite';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import viteReact from '@vitejs/plugin-react';
import fastifyReact from '@fastify/react/plugin';

const path = fileURLToPath(import.meta.url);
const root = join(dirname(path), 'client');
export default defineConfig({
  root,
  plugins: [viteReact(), fastifyReact()],
  ssr: {
    external: ['use-sync-external-store'],
  },
  resolve: {
    alias: [{ find: '@', replacement: root }],
  },
});

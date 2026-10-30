import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    rolldownOptions: {
      output: {
        manualChunks: (id) =>
          id.includes('/three/')
            ? 'three'
            : id.includes('/node_modules/react')
              ? 'react'
              : undefined,
      },
    },
  },
});

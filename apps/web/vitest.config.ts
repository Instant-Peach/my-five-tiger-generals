import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@ftg/game-core': path.resolve(__dirname, '../../packages/game-core/src'),
      '@ftg/game-renderer': path.resolve(__dirname, '../../packages/game-renderer/src'),
    },
  },
});

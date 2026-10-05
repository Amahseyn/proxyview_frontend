import path from 'path';
import { defineConfig } from 'vitest/config';

const TEST_DB_URL = 'file:../data/test.db';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    globalSetup: ['./tests/global-setup.ts'],
    testTimeout: 30_000,
    fileParallelism: false,
    env: {
      DATABASE_URL: TEST_DB_URL,
      NODE_ENV: 'test',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@hello/validation': resolve(__dirname, '../../packages/validation/src'),
      '@hello/types': resolve(__dirname, '../../packages/types/src'),
      '@hello/database': resolve(__dirname, '../../packages/database'),
    },
  },
})

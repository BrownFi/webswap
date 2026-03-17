/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

export default defineConfig({
  plugins: [react(), svgr(), tsconfigPaths()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      // Package ships source only (no dist), so point Vite at the TS source
      '@uniswap/token-lists': path.resolve(__dirname, 'node_modules/@uniswap/token-lists/src'),
    },
  },
  build: {
    outDir: 'build',
  },
  server: {
    port: 3000,
    open: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/setupTests.ts'],
    exclude: ['node_modules', 'cypress', 'build'],
  },
})

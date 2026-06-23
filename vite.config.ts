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
      '@brownfi/sdk': path.resolve(__dirname, 'src/lib/sdk'),
    },
  },
  build: {
    outDir: 'build',
    rollupOptions: {
      output: {
        manualChunks: {
          // Wallet / Web3 infrastructure
          'vendor-wallet': [
            '@rainbow-me/rainbowkit',
            'wagmi',
            '@wagmi/core',
            '@wagmi/connectors',
            '@walletconnect/ethereum-provider',
            '@walletconnect/modal',
          ],
          // Blockchain primitives
          'vendor-web3': ['viem', 'ethers', '@ethersproject/providers', '@ethersproject/contracts'],
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom', 'react-redux', '@reduxjs/toolkit'],
          // UI / Query
          'vendor-ui': ['@tanstack/react-query', 'styled-components', 'polished'],
          'vendor-recharts': ['recharts'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    // Dev mirror of the Vercel rewrite in vercel.json: proxy /prjx/* to the
    // Project X API (server-side) so the browser hits same-origin and dodges
    // their CORS allowlist. Prod uses the vercel.json rewrite instead.
    proxy: {
      '/prjx': {
        target: 'https://api.prjx.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/prjx/, ''),
      },
      // Dev mirror of functions/uniswap (CF) + api/uniswap (Vercel): proxy
      // /uniswap/* to the Uniswap gateway with an allowlisted Origin header so
      // the browser hits same-origin and the gateway doesn't 409 ACCESS_DENIED.
      '/uniswap': {
        target: 'https://interface.gateway.uniswap.org',
        changeOrigin: true,
        headers: { origin: 'https://app.uniswap.org', referer: 'https://app.uniswap.org/' },
        rewrite: (path) => path.replace(/^\/uniswap/, ''),
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/setupTests.ts'],
    exclude: ['node_modules', 'cypress', 'build'],
  },
})

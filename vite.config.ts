/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'
import fs from 'fs'
import { enabledModules } from './src/clmm/config/app-modules'

// CLMM (ported Algebra UI) ships several feature modules disabled. Replace their
// source with an empty stub at load time so their heavy deps never bundle — same
// mechanism the standalone app used, rescoped to src/clmm/modules.
const clmmDisabledModules = Object.entries(enabledModules)
  .filter(([, isEnabled]) => !isEnabled)
  .map(([key]) => key)

function ignoreDisabledClmmModules(dirs: string[]) {
  const emptyModulePath = path.resolve(__dirname, 'src/clmm/modules/__empty_module.ts')
  let emptyModuleCode = ''
  return {
    name: 'ignore-disabled-clmm-modules',
    load(id: string) {
      if (!emptyModuleCode) emptyModuleCode = fs.readFileSync(emptyModulePath, 'utf-8')
      for (const dir of dirs) {
        if (id.includes(`/src/clmm/modules/${dir}/`)) return emptyModuleCode
      }
      return null
    },
  }
}

export default defineConfig({
  plugins: [react(), svgr(), tsconfigPaths(), ignoreDisabledClmmModules(clmmDisabledModules)],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@brownfi/sdk': path.resolve(__dirname, 'src/lib/sdk'),
      '@clmm': path.resolve(__dirname, 'src/clmm'),
      jsbi: path.resolve(__dirname, 'node_modules/jsbi/dist/jsbi-cjs.js'),
      // CLMM was built on Reown AppKit; in webswap it shares RainbowKit. Redirect
      // the AppKit imports to local shims (see src/clmm/shims).
      '@reown/appkit/react': path.resolve(__dirname, 'src/clmm/shims/appkit-react.tsx'),
      '@reown/appkit/networks': path.resolve(__dirname, 'src/clmm/shims/appkit-networks.ts'),
      '@reown/appkit-adapter-wagmi': path.resolve(__dirname, 'src/clmm/shims/appkit-adapter.ts'),
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
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/setupTests.ts'],
    exclude: ['node_modules', 'cypress', 'build'],
  },
})

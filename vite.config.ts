/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

const UNISWAP_LIQUIDITY_UPSTREAM = 'https://liquidity.backend-prod.api.uniswap.org/uniswap.liquidity.v2.LiquidityService/GetPool'

function uniswapLiquidityProxy() {
  return {
    name: 'uniswap-liquidity-proxy',
    configureServer(server: { middlewares: { use: (path: string, handler: (req: any, res: any, next: () => void) => void) => void } }) {
      server.middlewares.use('/uniswap-liquidity', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(Buffer.from(chunk))
        const { poolIdentifiers, chainId } = JSON.parse(Buffer.concat(chunks).toString())
        if (chainId !== 4663 || !Array.isArray(poolIdentifiers) || poolIdentifiers.length > 18) {
          res.statusCode = 400
          res.end(JSON.stringify({ pools: [] }))
          return
        }
        const pools = []
        for (let i = 0; i < poolIdentifiers.length; i += 4) {
          const batch = await Promise.all(poolIdentifiers.slice(i, i + 4).map(async (addressOrId: string) => {
            try {
              const controller = new AbortController()
              const timeout = setTimeout(() => controller.abort(), 8_000)
              const response = await fetch(UNISWAP_LIQUIDITY_UPSTREAM, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pool: { addressOrId, chainId } }), signal: controller.signal })
              clearTimeout(timeout)
              return response.ok ? (await response.json()).pool ?? null : null
            } catch { return null }
          }))
          pools.push(...batch.filter(Boolean))
        }
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify({ pools }))
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), svgr(), tsconfigPaths(), uniswapLiquidityProxy()],
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
      // Dev mirror of functions/kyber-agg (CF) + vercel.json rewrite: proxy
      // /kyber-agg/* to the Kyber Aggregator API server-side (with a real
      // User-Agent) so the browser hits same-origin and dodges Kyber's
      // Cloudflare 403/bot-wall. Prod uses the CF Pages Function instead.
      '/kyber-agg': {
        target: 'https://aggregator-api.kyberswap.com',
        changeOrigin: true,
        headers: { 'user-agent': 'BrownFi-Webswap (+https://brownfi.io)' },
        rewrite: (path) => path.replace(/^\/kyber-agg/, ''),
      },
      '/uniswap-data': {
        target: 'https://entry-gateway.backend-prod.api.uniswap.org',
        changeOrigin: true,
        headers: { origin: 'https://app.uniswap.org', referer: 'https://app.uniswap.org/' },
        rewrite: (path) => path.replace(/^\/uniswap-data/, ''),
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

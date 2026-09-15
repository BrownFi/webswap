/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

const UNISWAP_LIQUIDITY_UPSTREAM = 'https://liquidity.backend-prod.api.uniswap.org/uniswap.liquidity.v2.LiquidityService/GetPool'
const ALLOWED_POOL_IDS = new Set(['0xd4EB21209C4D6093f80B5B84f5C45cc093EA14a3', '0x52e65B17fB6E5BA00Ed806f37Afcd2DaA50271Ca', '0x69BfaF19C9f377BB306a89aEd9F6B07e2c1a8d9a', '0xc61284332117c3FB23A2A56cceFFD07F7aF60029', '0xEb07d9587eFD1778dFb9c385Ec43EF6d5F9fE401', '0xDDCBBa3666f578E3F09516f21Ff85BFee859AB5e', '0xA43b424Bc609495AED4BCD88d654934b510B0aD9', '0xd057B1Bc54917855BBee58eAd58647f47caB35E5', '0xeb60bCD1D920ad6E102690CCFC6fB488899E1510', '0xf4ACdAEEB7022862A763C9B1B885e11191c889E3', '0x3bb34a44f1b2b5f32c034c38a53065a521a47b199700fa9bd19d60985ff24bf1', '0xe5923c8a8be481ec89a2ca784a2bbfa4235de6d88f92260fd66b660c4babf907', '0x2bca43d9d8c75399e3c6ba14e9dc88f44ca8968bb4694a8be4f80bd5a550df2e', '0xfe2a80bb5618fd14984b92ca6d45bf5ba67443ddb1435e28b2e48df2fc1526cd', '0x319bac87e616a89e241c10aeb8afd4892a852cdd8b373cd9765ecddc40b87cfe', '0x6fa3ee0048e78bf0a513eb0ab56f482944a767c21db990fcf555605e69f05659', '0x9194a557b6a6bb2236b49ea7e2bbccec5d3eeb705aef00903be4b3de1d949579', '0x8517f8071ae5b831b738052f12125e8e3d6c158b78728aa44ce3b25e5104d32e', '0xa92a3df27a00a276183ff7265fd8affa11df1fe8bb23ddfaf13f6c879a3f818b', '0xC3c9F0171490Ef0F4536fe493F3b0EbB5ee0CB5e'])

function uniswapLiquidityProxy() {
  return {
    name: 'uniswap-liquidity-proxy',
    configureServer(server: { middlewares: { use: (path: string, handler: (req: any, res: any, next: () => void) => void) => void } }) {
      server.middlewares.use('/uniswap-liquidity', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(Buffer.from(chunk))
        const { poolIdentifiers, chainId } = JSON.parse(Buffer.concat(chunks).toString())
        if (chainId !== 4663 || !Array.isArray(poolIdentifiers) || poolIdentifiers.length > 30 || poolIdentifiers.some((id: unknown) => typeof id !== 'string')) {
          res.statusCode = 400
          res.end(JSON.stringify({ pools: [] }))
          return
        }
        const pools = []
        for (let i = 0; i < poolIdentifiers.length; i += 4) {
          const batch = await Promise.all(poolIdentifiers.slice(i, i + 4).map(async (addressOrId: string) => {
            try {
              const response = await fetch(UNISWAP_LIQUIDITY_UPSTREAM, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pool: { addressOrId, chainId } }) })
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

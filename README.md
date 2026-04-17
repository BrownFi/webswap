# BrownFi Interface

An open source interface for BrownFi — a novel primitive AMM protocol for decentralized exchange with high capital efficiency.

- Website: [brownfi.io](https://brownfi.io/)
- Twitter: [x.com/BrownFiAMM](https://x.com/BrownFiAMM)
- Telegram: [t.me/brownfiammcommunity](https://t.me/brownfiammcommunity)
- Blog: [paragraph.com/@brownfi-amm](https://paragraph.com/@brownfi-amm)

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Install Dependencies

```bash
npm install
```

### Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | BrownFi API endpoint | `https://api.brownfi.io` |
| `VITE_ENVIRONMENT` | App environment (`mainnet`, `beta`, `testnet`) | `beta` |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | `your_project_id` |
| `VITE_KYBERSWAP_ZAP_API_URL` | KyberSwap Zap API for single-token liquidity | `https://zap-api.kyberswap.com` |

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Run Tests

```bash
npm run test
```

### Lint

```bash
npm run lint
```

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + styled-components
- **Web3**: wagmi + viem + RainbowKit
- **State**: Redux Toolkit + React Query
- **AMM SDK**: `@brownfi/sdk` (local TypeScript source at `src/lib/sdk/`)

## Supported Chains

- Berachain
- Arbitrum
- Base
- BSC
- Linea
- Sei
- HyperEVM
- Monad
- And more

## License

[GPL-3.0-or-later](./LICENSE)

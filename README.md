# brownfi Interface

An open source interface for brownfi -- a protocol for decentralized exchange 

- Website: https://browndex.io/
- Twitter: https://twitter.com/BrownFidex
- Mirror blog: https://mirror.xyz/0x64f4Fbd29b0AE2C8e18E7940CF823df5CB639bBa



## Development

### Install Dependencies

```bash
yarn
```

### Run

```bash
yarn start
```

### Configuring the environment (optional)

To have the interface default to a different network when a wallet is not connected:

1. Make a copy of `.env` named `.env.local`
2. Change `REACT_APP_NETWORK_ID` to `"{YOUR_NETWORK_ID}"`
3. Change `REACT_APP_NETWORK_URL` to e.g. `"https://{YOUR_NETWORK_ID}.infura.io/v3/{YOUR_INFURA_KEY}"`

Note that the interface only works on testnets where both
[brownfi V2](https://brownfi.org/docs/v2/smart-contracts/factory/) and
[multicall](https://github.com/makerdao/multicall) are deployed.
The interface will not work on other networks.

## Contributions

**Please open all pull requests against the `main` branch.**
CI checks will run against all PRs.

## Accessing brownfi Interface V1

The brownfi Interface supports swapping against, and migrating or removing liquidity from brownfi V1. However,
if you would like to use brownfi V1, the brownfi V1 interface for mainnet and testnets is accessible via IPFS gateways
linked from the [v1.0.0 release](https://github.com/brownfi/brownfi-interface/releases/tag/v1.0.0).

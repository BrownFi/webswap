# brownfi Interface

[![Unit Tests](https://github.com/brownfi/brownfi-interface/actions/workflows/unit-tests.yaml/badge.svg)](https://github.com/brownfi/brownfi-interface/actions/workflows/unit-tests.yaml)
[![Integration Tests](https://github.com/brownfi/brownfi-interface/actions/workflows/integration-tests.yaml/badge.svg)](https://github.com/brownfi/brownfi-interface/actions/workflows/integration-tests.yaml)
[![Lint](https://github.com/brownfi/brownfi-interface/actions/workflows/lint.yml/badge.svg)](https://github.com/brownfi/brownfi-interface/actions/workflows/lint.yml)
[![Release](https://github.com/brownfi/brownfi-interface/actions/workflows/release.yaml/badge.svg)](https://github.com/brownfi/brownfi-interface/actions/workflows/release.yaml)

An open source interface for brownfi -- a protocol for decentralized exchange of Ethereum tokens.

- Website: [brownfi.org](https://brownfi.org/)
- Interface: [app.brownfi.org](https://app.brownfi.org)
- Docs: [brownfi.org/docs/](https://brownfi.org/docs/)
- Twitter: [@brownfiProtocol](https://twitter.com/brownfiProtocol)
- Reddit: [/r/brownfi](https://www.reddit.com/r/brownfi/)
- Email: [contact@brownfi.org](mailto:contact@brownfi.org)
- Discord: [brownfi](https://discord.gg/FCfyBSbCU5)
- Whitepaper: [Link](https://hackmd.io/C-DvwDSfSxuh-Gd4WKE_ig)

## Accessing the brownfi Interface

To access the brownfi Interface, use an IPFS gateway link from the
[latest release](https://github.com/brownfi/brownfi-interface/releases/latest),
or visit [app.brownfi.org](https://app.brownfi.org).

## Listing a token

Please see the
[@brownfi/default-token-list](https://github.com/brownfi/default-token-list)
repository.

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

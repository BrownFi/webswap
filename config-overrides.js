// Overrides create-react-app webpack configs without ejecting
// https://github.com/timarney/react-app-rewired

const { useBabelRc, override } = require('customize-cra')
module.exports = {
  webpack: override(useBabelRc()),
  jest: (config) => {
    config.transformIgnorePatterns = [
      '/node_modules/(?!(@rainbow-me/rainbowkit|wagmi|@wagmi|viem|@tanstack)/)',
    ]
    return config
  },
}

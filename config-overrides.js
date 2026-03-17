// Overrides create-react-app webpack configs without ejecting
// https://github.com/timarney/react-app-rewired

const { useBabelRc, override } = require('customize-cra')

const ignoreSourceMapWarnings = () => (config) => {
  config.ignoreWarnings = [
    { module: /node_modules/ },
  ]
  return config
}

module.exports = {
  webpack: override(useBabelRc(), ignoreSourceMapWarnings()),
  jest: (config) => {
    config.transformIgnorePatterns = [
      '/node_modules/(?!(@rainbow-me/rainbowkit|wagmi|@wagmi|viem|@tanstack)/)',
    ]
    return config
  },
}

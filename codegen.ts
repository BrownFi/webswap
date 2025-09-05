import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  documents: ['src/**/*.{ts,tsx}'],
  generates: {
    './src/__generated__/': {
      plugins: [],
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql',
      },
    },
  },
  ignoreNoDocuments: true,
  schema: 'https://hyperliquid-bf-indexer.vietcha.in',
}

export default config

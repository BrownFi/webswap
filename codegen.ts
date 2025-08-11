import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  documents: ['src/**/*.{ts,tsx}'],
  generates: {
    './src/__generated__/': {
      plugins: [],
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql'
      }
    }
  },
  ignoreNoDocuments: true,
  schema: 'https://bf-indexer.vietcha.in/graphql'
}

export default config

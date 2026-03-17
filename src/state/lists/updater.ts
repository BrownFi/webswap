import { useAllInactiveTokens } from 'hooks/Tokens'

export default function Updater(): null {
  // Initialize inactive tokens so they're available for search
  useAllInactiveTokens()
  return null
}

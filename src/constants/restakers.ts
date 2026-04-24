import { ChainId } from 'lib/sdk/constants/chainId'
import infraredIcon from 'assets/images/platforms/infrared.png'
import berahubIcon from 'assets/svg/berahub.svg'

export type RestakerPlatform = 'Infrared' | 'BeraHub'

export type RestakerConfig = {
  platform: RestakerPlatform
  vaultAddress: string
  stakePageUrl: string
  iconUrl?: string
}

const PLATFORM_ICONS: Record<RestakerPlatform, string> = {
  Infrared: infraredIcon,
  BeraHub: berahubIcon,
}

// Keys are lowercase pair (LP token) addresses.
// Only Berachain has this today. Extend with new pairs/platforms as they launch.
const BERA_RESTAKERS: Record<string, RestakerConfig[]> = {
  // WBERA / USDC.e
  '0xd57da672354905b9e42df077df77e554dc5fd1cc': [
    {
      platform: 'Infrared',
      vaultAddress: '0x6ef2ce62ceb0abd9d4841ddd7ac806fa2e3a7e34',
      stakePageUrl: 'https://infrared.finance/pol-vaults/brownfi-wbera-usdc.e',
    },
    {
      platform: 'BeraHub',
      vaultAddress: '0x519cef5cc2913bcefdd03d0a22601c19794c4581',
      stakePageUrl:
        'https://hub.berachain.com/earn/0x519cef5cc2913bcefdd03d0a22601c19794c4581',
    },
  ],
  // WBERA / HONEY
  '0xd932c344e21ef6c3a94971bf4d4cc71304e2a66c': [
    {
      platform: 'Infrared',
      vaultAddress: '0x7488174f1f518caf2faae4f30cbba65ea57cf4f9',
      stakePageUrl: 'https://infrared.finance/pol-vaults/brownfi-wbera-honey',
    },
    {
      platform: 'BeraHub',
      vaultAddress: '0x2cb34eeadb1e7ae9cc7bafb84a189e9d921e193a',
      stakePageUrl:
        'https://hub.berachain.com/earn/0x2cb34eeadb1e7ae9cc7bafb84a189e9d921e193a',
    },
  ],
}

const RESTAKERS_BY_CHAIN: Record<number, Record<string, RestakerConfig[]>> = {
  [ChainId.BERA_MAINNET]: BERA_RESTAKERS,
}

export function getRestakers(chainId: number | undefined, pairAddress: string | undefined): RestakerConfig[] {
  if (!chainId || !pairAddress) return []
  const forChain = RESTAKERS_BY_CHAIN[chainId]
  if (!forChain) return []
  const list = forChain[pairAddress.toLowerCase()] ?? []
  return list.map((r) => ({ ...r, iconUrl: r.iconUrl ?? PLATFORM_ICONS[r.platform] }))
}

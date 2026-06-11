import { Currency } from '@brownfi/sdk'
import styled from 'styled-components'
import { CurrencyLogo } from 'components/CurrencyLogo'
import { getTokenSymbol } from 'utils'
import { useActiveWeb3React } from 'hooks'
import { shouldReverse } from 'utils/pair'

interface DoubleCurrencyLogoProps {
  margin?: boolean
  size?: number
  currency0?: Currency
  currency1?: Currency
  // Optional chainId override for cross-chain rendering (Portfolio aggregates
  // positions from multiple chains; without this prop the wallet's chain
  // wins and Bera native ETHER would resolve to "HYPE" when wallet sits on
  // HyperEVM). See CurrencyLogo for the same prop.
  chainId?: number
}

export const HigherLogo = styled(CurrencyLogo)``

export function DoubleCurrencyLogo({ currency0, currency1, size = 16, margin = false, chainId: chainIdProp }: DoubleCurrencyLogoProps) {
  const { chainId: walletChainId } = useActiveWeb3React()
  const chainId = chainIdProp ?? walletChainId
  const symbols = [getTokenSymbol(currency0, chainId), getTokenSymbol(currency1, chainId)]
  const pair = symbols.join('/')
  const isReversed = shouldReverse(pair)
  const first = isReversed ? currency1 : currency0
  const second = isReversed ? currency0 : currency1

  // For large sizes (pool rows), use Figma layout: 64x60 container, 40px icons, offset
  const isLarge = size >= 32
  if (isLarge) {
    return (
      <div style={{ position: 'relative', width: '64px', height: '60px', flexShrink: 0 }}>
        {first && (
          <div style={{ position: 'absolute', left: 0, top: 0, width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', zIndex: 2 }}>
            <CurrencyLogo currency={first} size="40px" chainId={chainIdProp} />
          </div>
        )}
        {second && (
          <div style={{ position: 'absolute', left: '24px', top: '20px', width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', zIndex: 1 }}>
            <CurrencyLogo currency={second} size="40px" chainId={chainIdProp} />
          </div>
        )}
      </div>
    )
  }

  // Small size: simple inline overlap
  return (
    <div style={{ position: 'relative', display: 'flex', marginRight: margin ? `${size / 3 + 8}px` : undefined }}>
      {first && <CurrencyLogo currency={first} size={`${size}px`} style={{ zIndex: 2 }} chainId={chainIdProp} />}
      {second && <CurrencyLogo currency={second} size={`${size}px`} style={{ position: 'absolute', left: `${size * 0.6}px`, zIndex: 1 }} chainId={chainIdProp} />}
    </div>
  )
}

type DoubleCurrencySymbolProps = {
  currency0?: Currency
  currency1?: Currency
  // Optional chainId override for cross-chain rendering (see DoubleCurrencyLogo).
  chainId?: number
}

export const DoubleCurrencySymbol = ({ currency0, currency1, chainId: chainIdProp }: DoubleCurrencySymbolProps) => {
  const { chainId: walletChainId } = useActiveWeb3React()
  const chainId = chainIdProp ?? walletChainId
  const symbols = [getTokenSymbol(currency0, chainId), getTokenSymbol(currency1, chainId)]
  const pair = symbols.join('/')
  return <>{shouldReverse(pair) ? symbols.reverse().join('/') : pair}</>
}

import { ChainId, Currency, ETHER, Token } from '@brownfi/sdk'
import React, { useMemo } from 'react'
import styled from 'styled-components'
import EthereumLogo from '../../assets/images/ethereum-logo.png'
import BNBLogo from '../../assets/images/bnb.svg'
import VictionLogo from '../../assets/images/viction.png'
import useHttpLocations from '../../hooks/useHttpLocations'
import { WrappedTokenInfo } from '../../state/lists/hooks'
import Logo from '../Logo'
import { useActiveWeb3React } from 'hooks'

export const getTokenLogoURL = (address: string) =>
  `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`

const StyledEthereumLogo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
`

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  background-color: ${({ theme }) => theme.white};
`

export default function CurrencyLogo({
  currency,
  size = '24px',
  style
}: {
  currency?: Currency
  size?: string
  style?: React.CSSProperties
}) {
  const { chainId } = useActiveWeb3React()
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)

  const srcs: string[] = useMemo(() => {
    if (currency === ETHER) return []

    if (currency instanceof Token) {
      if (currency instanceof WrappedTokenInfo) {
        return [...uriLocations, getTokenLogoURL(currency.address)]
      }
      return [getTokenLogoURL(currency.address)]
    }
    return []
  }, [currency, uriLocations])

  if ((currency as any)?.logoURI) {
    return <StyledEthereumLogo src={(currency as any)?.logoURI} size={size} style={style} />
  }

  if ((currency as any)?.symbol === 'WBNB') {
    return <StyledEthereumLogo src={BNBLogo} size={size} style={style} />
  }

  if (currency === ETHER) {
    if (chainId === ChainId.BSC_TESTNET) {
      return <StyledEthereumLogo src={BNBLogo} size={size} style={style} />
    }
    if (chainId === ChainId.VICTION_TESTNET) {
      return <StyledEthereumLogo src={VictionLogo} size={size} style={style} />
    }
    return <StyledEthereumLogo src={EthereumLogo} size={size} style={style} />
  }

  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} />
}

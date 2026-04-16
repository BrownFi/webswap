import { ChainId, Currency, ETHER, Token } from '@brownfi/sdk'
import { useActiveWeb3React } from 'hooks'
import React, { useMemo } from 'react'
import styled from 'styled-components'
import BNBLogo from 'assets/images/bnb.svg'
import EthereumLogo from 'assets/images/ethereum-logo.png'
import hyperevmLogo from 'assets/images/hyperevm.png'
import seiLogo from 'assets/images/sei.png'
import monadLogo from 'assets/images/monad.png'
import u2uLogo from 'assets/images/u2u.jpg'
import VictionLogo from 'assets/images/viction.png'
import beraLogo from 'assets/images/w-bera.png'
import useHttpLocations from 'hooks/useHttpLocations'
import { findLogoBySymbol, findLogoURI, WrappedTokenInfo } from 'state/lists/hooks'
import { Logo } from 'components/Logo'

const StyledEthereumLogo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 50%;
  object-fit: cover;
`

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 50%;
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  background-color: ${({ theme }) => theme.white};
  object-fit: cover;
`

export function CurrencyLogo({
  currency,
  size = '24px',
  style,
}: {
  currency?: Currency
  size?: string
  style?: React.CSSProperties
}) {
  const { chainId } = useActiveWeb3React()
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)

  const defaultSrcs: string[] = useMemo(() => {
    if (currency === ETHER) return []

    if (currency instanceof Token) {
      if (currency instanceof WrappedTokenInfo) {
        return [...uriLocations]
      }
      return []
    }
    return []
  }, [currency, uriLocations])

  const srcs: string[] = useMemo(() => {
    if (defaultSrcs.length === 0) {
      const logoURI = findLogoURI(currency as Token)
      if (logoURI) {
        return [logoURI]
      }
    }
    return defaultSrcs
  }, [currency, defaultSrcs])

  const srcsSymbol: string[] = useMemo(() => {
    if (defaultSrcs.length === 0) {
      const logoURI = findLogoBySymbol(currency as Token)
      if (logoURI) {
        return [logoURI]
      }
    }
    return defaultSrcs
  }, [currency, defaultSrcs])

  if ((currency as any)?.logoURI) {
    return <StyledEthereumLogo src={(currency as any)?.logoURI} size={size} style={style} />
  }

  if (srcs.length > 0) {
    return (
      <StyledLogo
        size={size}
        srcs={srcs}
        alt={`${currency?.symbol ?? 'token'} logo`}
        style={style}
        className="!bg-transparent"
      />
    )
  }

  if (currency?.symbol === 'WVIC') {
    return <StyledEthereumLogo src={VictionLogo} size={size} style={style} />
  }
  if (currency?.symbol === 'WU2U') {
    return <StyledEthereumLogo src={u2uLogo} size={size} style={style} />
  }
  if (currency?.symbol === 'WBNB') {
    return <StyledEthereumLogo src={BNBLogo} size={size} style={style} />
  }
  if (currency?.symbol === 'WBERA') {
    return <StyledEthereumLogo src={beraLogo} size={size} style={style} />
  }
  if (currency?.symbol === 'WHYPE') {
    return <StyledEthereumLogo src={hyperevmLogo} size={size} style={style} />
  }
  if (currency?.symbol === 'WSEI') {
    return <StyledEthereumLogo src={seiLogo} size={size} style={style} />
  }
  if (currency?.symbol === 'WMON') {
    return <StyledEthereumLogo src={monadLogo} size={size} style={style} />
  }
  if (currency?.symbol === 'WETH') {
    return <StyledEthereumLogo src={EthereumLogo} size={size} style={style} />
  }

  if (currency === ETHER) {
    if (chainId === ChainId.VICTION_TESTNET || chainId === ChainId.VICTION_MAINNET) {
      return <StyledEthereumLogo src={VictionLogo} size={size} style={style} />
    }
    if (chainId === ChainId.U2U_MAINNET) {
      return <StyledEthereumLogo src={u2uLogo} size={size} style={style} />
    }
    if (chainId === ChainId.BSC_TESTNET || chainId === ChainId.BSC_MAINNET) {
      return <StyledEthereumLogo src={BNBLogo} size={size} style={style} />
    }
    if (chainId === ChainId.BERA_MAINNET) {
      return <StyledEthereumLogo src={beraLogo} size={size} style={style} />
    }
    if (chainId === ChainId.HYPER_EVM) {
      return <StyledEthereumLogo src={hyperevmLogo} size={size} style={style} />
    }
    if (chainId === ChainId.SEI_MAINNET) {
      return <StyledEthereumLogo src={seiLogo} size={size} style={style} />
    }
    if (chainId === ChainId.MONAD) {
      return <StyledEthereumLogo src={monadLogo} size={size} style={style} />
    }
    return <StyledEthereumLogo src={EthereumLogo} size={size} style={style} />
  }

  return <StyledLogo size={size} srcs={srcsSymbol} alt={`${currency?.symbol ?? 'token'} logo`} style={style} />
}

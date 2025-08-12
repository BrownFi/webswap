import { ChainId, Currency, ETHER, Token } from '@brownfi/sdk'
import { useActiveWeb3React } from 'hooks'
import React, { useMemo } from 'react'
import styled from 'styled-components'
import BNBLogo from 'assets/images/bnb.svg'
import bobaLogo from 'assets/images/boba.svg'
import EthereumLogo from 'assets/images/ethereum-logo.png'
import hyperevmLogo from 'assets/images/hyperevm.png'
import metisLogo from 'assets/images/metis.png'
import sonicLogo from 'assets/images/sonic.png'
import u2uLogo from 'assets/images/u2u.jpg'
import VictionLogo from 'assets/images/viction.png'
import beraLogo from 'assets/images/w-bera.png'
import useHttpLocations from 'hooks/useHttpLocations'
import { findLogoURI, WrappedTokenInfo } from 'state/lists/hooks'
import { Logo } from 'components/Logo'

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

  if ((currency as any)?.symbol === 'WBNB') {
    return <StyledEthereumLogo src={BNBLogo} size={size} style={style} />
  }
  if ((currency as any)?.symbol === 'WVIC') {
    return <StyledEthereumLogo src={VictionLogo} size={size} style={style} />
  }
  if ((currency as any)?.symbol === 'WS') {
    return <StyledEthereumLogo src={sonicLogo} size={size} style={style} />
  }
  if ((currency as any)?.symbol === 'WMETIS' || (currency as any)?.symbol === 'METIS') {
    return <StyledEthereumLogo src={metisLogo} size={size} style={style} />
  }
  if ((currency as any)?.symbol === 'WETH') {
    return <StyledEthereumLogo src={EthereumLogo} size={size} style={style} />
  }
  if ((currency as any)?.symbol === 'WU2U') {
    return <StyledEthereumLogo src={u2uLogo} size={size} style={style} />
  }
  if ((currency as any)?.symbol === 'WBOBA') {
    return <StyledEthereumLogo src={bobaLogo} size={size} style={style} />
  }
  if ((currency as any)?.symbol === 'WBERA') {
    return <StyledEthereumLogo src={beraLogo} size={size} style={style} />
  }
  if ((currency as any)?.symbol === 'WHYPE') {
    return <StyledEthereumLogo src={hyperevmLogo} size={size} style={style} />
  }
  if ((currency as any)?.symbol === 'BOBA') {
    return <StyledEthereumLogo src={bobaLogo} size={size} style={style} />
  }

  if (currency === ETHER) {
    if (chainId === ChainId.BSC_TESTNET || chainId === ChainId.BSC_MAINNET) {
      return <StyledEthereumLogo src={BNBLogo} size={size} style={style} />
    }
    if (chainId === ChainId.VICTION_TESTNET || chainId === ChainId.VICTION_MAINNET) {
      return <StyledEthereumLogo src={VictionLogo} size={size} style={style} />
    }
    if (chainId === ChainId.SONIC_TESTNET) {
      return <StyledEthereumLogo src={sonicLogo} size={size} style={style} />
    }
    if (chainId === ChainId.METIS_MAINNET) {
      return <StyledEthereumLogo src={metisLogo} size={size} style={style} />
    }
    if (chainId === ChainId.U2U_MAINNET) {
      return <StyledEthereumLogo src={u2uLogo} size={size} style={style} />
    }
    if (chainId === ChainId.BERA_MAINNET) {
      return <StyledEthereumLogo src={beraLogo} size={size} style={style} />
    }
    if (chainId === ChainId.HYPER_EVM) {
      return <StyledEthereumLogo src={hyperevmLogo} size={size} style={style} />
    }
    return <StyledEthereumLogo src={EthereumLogo} size={size} style={style} />
  }

  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} />
}

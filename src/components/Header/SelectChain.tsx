import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useToggleModal } from '../../state/application/hooks'
import down from '../../assets/svg/arrow_drop_down.svg'
import check from '../../assets/svg/check.svg'
// import ethereum from '../../assets/images/ethereum-logo.png'
// import bnb from '../../assets/images/bnb.svg'
import viction from '../../assets/images/viction.png'
// import sonicIcon from '../../assets/images/sonic.png'
// import soneiumIcon from '../../assets/images/soneium.svg'
// import baseIcon from '../../assets/svg/base.svg'
import Web3 from 'web3'
// import auroraIcon from '../../assets/images/aurora.png'
import metisIcon from '../../assets/images/metis.png'
import u2uIcon from '../../assets/images/u2u.jpg'

import { ChainId, ChainIdHex } from '@brownfi/sdk'
import { useActiveWeb3React } from 'hooks'
import {
  injected,
  networkBaseTestnet,
  networkMinato,
  networkSepolia,
  networkSonic,
  networkUnichainTestnet,
  networkVictionMainnet,
  networkAuroraTestnet,
  networkMetisMainnet,
  networkU2UMainnet
} from 'connectors'
import { WalletConnectConnector } from 'connectors/WalletConnector'
import { CHAIN_TO_METAMASK } from '../../constants'
import { useDefaultChain } from 'hooks/useDefaultChain'

const StyledMenuButton = styled.button`
  width: 240px;
  height: 56px;
  border: none;
  background-color: #1e1e1e;
  margin: 0;
  padding: 0;

  padding: 0 20px;
  color: white;
  font-size: 16px;
  font-weight: 500;

  display: flex;
  align-items: center;
  justify: flex-start;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
  }

  svg {
    margin-top: 2px;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
  width: 100%;
 `};
`

const StyledMenu = styled.div`
  margin-left: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
  margin-right: 16px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
   margin-right: 8px;
   margin-left: 0;
  `};
`

const MenuFlyout = styled.span`
  width: 240px;
  background-color: #1e1e1e;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 0;
  padding: 4px 0;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: 4rem;
  right: 0rem;
  z-index: 100;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    top: -140px;
    width: 210px;
    left: 0
  `};
`

const MenuItem = styled.div`
  flex: 1;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  :hover {
    color: ${({ theme }) => theme.greenMain};
    cursor: pointer;
    text-decoration: none;
  }
  > svg {
    margin-right: 8px;
  }
`

const CHAINS: any = {
  [ChainId.VICTION_MAINNET]: {
    name: 'Viction Mainnet',
    chainId: ChainId.VICTION_MAINNET,
    icon: viction
  },
  [ChainId.METIS_MAINNET]: {
    name: 'Metis',
    chainId: ChainId.METIS_MAINNET,
    icon: metisIcon
  },
  [ChainId.U2U_MAINNET]: {
    name: 'U2U Mainnet',
    chainId: ChainId.U2U_MAINNET,
    icon: u2uIcon
  }
}

export default function SelectChain() {
  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.SELECT_CHAIN)
  const toggle = useToggleModal(ApplicationModal.SELECT_CHAIN)
  useOnClickOutside(node, open ? toggle : undefined)
  const { account, chainId, activate, connector } = useActiveWeb3React()
  const { getChainDefault, saveChainDefault } = useDefaultChain()
  const savedChain = getChainDefault()

  const handleSelectChain = async (chain: ChainId) => {
    if (account) {
      if (window.ethereum && connector === injected) {
        try {
          if (chainId !== chain) {
            const web3 = new Web3(window.ethereum as any)
            await (window.ethereum as any)?.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: ChainIdHex[chain] }] // chainId must be in hexadecimal numbers
            })
            const accounts = await web3.eth.getAccounts()
            if (accounts[0]) {
              activate(injected, undefined, true)
                .then(() => {
                  saveChainDefault(chain)
                })
                .catch(error => {
                  console.error('Failed to activate after accounts changed', error)
                })
            }
          }
        } catch (e) {
          if ((e as any)?.code === 4902 && CHAIN_TO_METAMASK[chain]) {
            const web3 = new Web3(window.ethereum as any)
            await (window.ethereum as any)?.request({
              method: 'wallet_addEthereumChain',
              params: [CHAIN_TO_METAMASK[chain]] // chainId must be in hexadecimal numbers
            })
            const accounts = await web3.eth.getAccounts()
            if (accounts[0]) {
              activate(injected, undefined, true)
                .then(() => {
                  saveChainDefault(chain)
                })
                .catch(error => {
                  console.error('Failed to activate after accounts changed', error)
                })
            }
          }
        }
      } else if (connector instanceof WalletConnectConnector) {
        connector.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ChainIdHex[chain] }]
        })
      }
    } else {
      activate(
        chain === ChainId.U2U_MAINNET
          ? networkU2UMainnet
          : chain === ChainId.METIS_MAINNET
          ? networkMetisMainnet
          : chain === ChainId.AURORA_TESTNET
          ? networkAuroraTestnet
          : chain === ChainId.UNICHAIN_SEPOLIA
          ? networkUnichainTestnet
          : chain === ChainId.BASE_SEPOLIA
          ? networkBaseTestnet
          : chain === ChainId.BSC_TESTNET
          ? networkVictionMainnet
          : chain === ChainId.SEPOLIA
          ? networkSepolia
          : chain === ChainId.VICTION_MAINNET
          ? networkVictionMainnet
          : chain === ChainId.SONIC_TESTNET
          ? networkSonic
          : chain === ChainId.MINATO_SONEIUM
          ? networkMinato
          : networkVictionMainnet
      )
      saveChainDefault(chain)
    }
  }

  useEffect(() => {
    if (savedChain) {
      handleSelectChain(Number(savedChain))
      return
    }
    handleSelectChain(ChainId.VICTION_MAINNET)
  }, [savedChain])

  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <StyledMenu ref={node as any}>
      <StyledMenuButton onClick={toggle}>
        <div className="flex items-center flex-1">
          <img
            alt="icon"
            className="w-[28px] mr-[8px] rounded-full"
            src={CHAINS[chainId || ChainId.VICTION_MAINNET]?.icon}
          />
          {CHAINS[chainId || ChainId.VICTION_MAINNET]?.name}
        </div>
        <img src={down} alt="down" className="w-[24px] ml-[8px]" />
      </StyledMenuButton>
      {open && (
        <MenuFlyout>
          {Object.values(CHAINS).map((item: any) => (
            <MenuItem
              id="link"
              onClick={() => {
                handleSelectChain(item.chainId)
              }}
              key={item.chainId}
            >
              <div className="flex items-center flex-1 whitespace-nowrap">
                <img alt="icon" className="w-[24px] mr-[12px] rounded-full" src={item.icon} />
                {item.name}
              </div>
              {chainId === item.chainId && <img src={check} alt="check" className="w-[20px]" />}
            </MenuItem>
          ))}
        </MenuFlyout>
      )}
    </StyledMenu>
  )
}

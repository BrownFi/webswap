import React, { useRef } from 'react'
import styled from 'styled-components'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useToggleModal } from '../../state/application/hooks'
import down from '../../assets/svg/arrow_drop_down.svg'
import check from '../../assets/svg/check.svg'
import ethereum from '../../assets/images/ethereum-logo.png'
import Web3 from 'web3'

import { ChainId, ChainIdHex } from '@brownfi/sdk'
import { useActiveWeb3React } from 'hooks'
import { injected, network, networkSepolia } from 'connectors'
import { WalletConnectConnector } from 'connectors/WalletConnector'

const StyledMenuButton = styled.button`
  width: 210px;
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
  width: 210px;
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
    top: -60px;
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

export default function SelectChain() {
  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.SELECT_CHAIN)
  const toggle = useToggleModal(ApplicationModal.SELECT_CHAIN)
  useOnClickOutside(node, open ? toggle : undefined)
  const { account, chainId, activate, connector } = useActiveWeb3React()

  const handleSelectChain = async (chain: ChainId) => {
    if (account) {
      if (window.ethereum && connector === injected) {
        if (chainId !== chain) {
          const web3 = new Web3(window.ethereum as any)
          await (window.ethereum as any)?.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ChainIdHex[chain] }] // chainId must be in hexadecimal numbers
          })
          const accounts = await web3.eth.getAccounts()
          if (accounts[0]) {
            activate(injected, undefined, true).catch(error => {
              console.error('Failed to activate after accounts changed', error)
            })
          }
        }
      } else if (connector instanceof WalletConnectConnector) {
        connector.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ChainIdHex[chain] }]
        })
      }
    } else {
      activate(chain === ChainId.BSC_TESTNET ? network : networkSepolia)
    }
  }

  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <StyledMenu ref={node as any}>
      <StyledMenuButton onClick={toggle}>
        <div className="flex-1 flex items-center">
          <img alt="icon" className="w-[28px] mr-[8px]" src={ethereum} />
          {chainId === ChainId.BSC_TESTNET ? 'BSC Testnet' : 'Sepolia'}
        </div>

        <img src={down} alt="down" className="w-[24px] ml-[8px]" />
      </StyledMenuButton>

      {open && (
        <MenuFlyout>
          <MenuItem
            id="link"
            onClick={() => {
              handleSelectChain(ChainId.BSC_TESTNET)
            }}
          >
            <div className="flex-1 flex items-center">
              <img alt="icon" className="w-[24px] mr-[12px]" src={ethereum} />
              BSC Testnet
            </div>
            {chainId === ChainId.BSC_TESTNET && <img src={check} alt="check" className="w-[20px]" />}
          </MenuItem>
          <MenuItem
            id="link"
            onClick={() => {
              handleSelectChain(ChainId.SEPOLIA)
            }}
          >
            <div className="flex-1 flex items-center">
              <img alt="icon" className="w-[24px] mr-[12px]" src={ethereum} />
              Sepolia
            </div>
            {chainId === ChainId.SEPOLIA && <img src={check} alt="check" className="w-[20px]" />}
          </MenuItem>
        </MenuFlyout>
      )}
    </StyledMenu>
  )
}

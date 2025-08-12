import { useState } from 'react'

import { Token } from '@brownfi/sdk'
import { TokenList } from '@uniswap/token-lists'
import { ChevronLeft } from 'react-feather'
import { Text } from 'rebass'
import styled from 'styled-components'

import { RowBetween } from 'components/Row'

import { CloseIcon } from 'theme'

import { CurrencyModalView } from './CurrencySearchModal'
import { ManageLists } from './ManageLists'
import ManageTokens from './ManageTokens'
import { PaddedColumn } from './styleds'

const Wrapper = styled.div`
  width: 100%;
  position: relative;
  padding-bottom: 80px;
`

const ToggleWrapper = styled(RowBetween)`
  background-color: transparent;
  border-radius: 0;
  padding: 0;
`

const ToggleOption = styled.div<{ active?: boolean }>`
  width: 50%;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0;
  font-weight: 600;
  background-color: ${({ theme, active }) => (active ? theme.primary1 : '#323038')};
  color: white;
  user-select: none;

  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

export default function Manage({
  onDismiss,
  setModalView,
  setImportList,
  setImportToken,
  setListUrl,
}: {
  onDismiss: () => void
  setModalView: (view: CurrencyModalView) => void
  setImportToken: (token: Token) => void
  setImportList: (list: TokenList) => void
  setListUrl: (url: string) => void
}) {
  // toggle between tokens and lists
  const [showLists, setShowLists] = useState(true)

  return (
    <Wrapper className="relative">
      <PaddedColumn>
        <RowBetween>
          <div className="flex items-center">
            <ChevronLeft
              style={{ cursor: 'pointer' }}
              onClick={() => setModalView(CurrencyModalView.search)}
              color={'white'}
            />
            <Text fontWeight={500} fontSize={24} fontFamily={'Russo One'} color={'white'}>
              Manage
            </Text>
          </div>

          <CloseIcon onClick={onDismiss} color={'white'} className="absolute top-[16px] right-[16px]" />
        </RowBetween>
      </PaddedColumn>
      {/* <Separator /> */}
      <PaddedColumn style={{ paddingBottom: 0 }}>
        <ToggleWrapper>
          <ToggleOption onClick={() => setShowLists(!showLists)} active={showLists}>
            Lists
          </ToggleOption>
          <ToggleOption onClick={() => setShowLists(!showLists)} active={!showLists}>
            Tokens
          </ToggleOption>
        </ToggleWrapper>
      </PaddedColumn>
      {showLists ? (
        <ManageLists setModalView={setModalView} setImportList={setImportList} setListUrl={setListUrl} />
      ) : (
        <ManageTokens setModalView={setModalView} setImportToken={setImportToken} />
      )}
    </Wrapper>
  )
}

import styled from 'styled-components'
import { AutoColumn } from 'components/Column'
import { RowFixed } from 'components/Row'

export const ModalInfo = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: 1rem 1rem;
  margin: 0.25rem 0.5rem;
  justify-content: center;
  flex: 1;
  user-select: none;
`
export const StyledMenu = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
`

export const PopoverContainer = styled.div<{ show: boolean }>`
  z-index: 100;
  visibility: ${(props) => (props.show ? 'visible' : 'hidden')};
  opacity: ${(props) => (props.show ? 1 : 0)};
  transition: visibility 150ms linear, opacity 150ms linear;
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  color: ${({ theme }) => theme.text2};
  border-radius: 0.5rem;
  padding: 1rem;
  display: grid;
  grid-template-rows: 1fr;
  grid-gap: 8px;
  font-size: 1rem;
  text-align: left;
  top: 80px;
`

export const TextDot = styled.div`
  height: 3px;
  width: 3px;
  background-color: ${({ theme }) => theme.text2};
  border-radius: 50%;
`

export const FadedSpan = styled(RowFixed)`
  color: ${({ theme }) => theme.primary1};
  font-size: 14px;
`
export const Checkbox = styled.input`
  border: 1px solid ${({ theme }) => theme.red3};
  height: 20px;
  margin: 0;
`

export const PaddedColumn = styled(AutoColumn)`
  padding: 24px 24px 12px 24px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
   padding: 16px 16px 12px 16px;
  `};
`

export const MenuItem = styled.div<{ disabled?: boolean; selected?: boolean }>`
  margin: 0 24px;
  padding: 12px;
  height: 68px;
  display: grid;
  grid-template-columns: auto minmax(auto, 1fr) auto minmax(0, 72px);
  grid-gap: 16px;
  align-items: center;
  cursor: ${({ disabled }) => !disabled && 'pointer'};
  pointer-events: ${({ disabled }) => disabled && 'none'};
  :hover {
    background-color: ${({ disabled, selected }) => (!disabled && !selected ? '#252528' : 'transparent')};
  }
  opacity: ${({ disabled, selected }) => (disabled || selected ? 0.4 : 1)};
  ${({ selected }) => selected && 'background-color: #252528;'}
  width: calc(100% - 40px) !important;
  ${({ theme }) => theme.mediaWidth.upToMedium`
   width: calc(100% - 24px) !important;
   margin: 0 20px;
  `};
`

export const SearchInput = styled.input`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  white-space: nowrap;
  background: none;
  outline: none;
  border-radius: 0;
  color: white;
  -webkit-appearance: none;

  font-size: 14px;
  background-color: #111114;
  font-weight: 500;
  height: 44px;
  padding: 0 20px 0 50px;
  border: 1px solid #FFFFFF10;
  ::placeholder {
    color: #6C7284;
  }
  transition: border 150ms;
  :focus {
    border: 1px solid #27E3AB60;
    outline: none;
  }
`
export const Separator = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.bg2};
`

export const SeparatorDark = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.bg3};
`

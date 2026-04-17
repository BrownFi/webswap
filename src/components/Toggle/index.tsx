import styled from 'styled-components'

const ToggleElement = styled.span<{ isActive?: boolean; isOnSwitch?: boolean }>`
  padding: 5px 16px;
  border-radius: 100px;
  background: ${({ isActive }) =>
    isActive
      ? '#985C2A'
      : 'none'};
  color: ${({ isActive }) =>
    isActive ? '#FFFFFF' : '#B8ADA4'};
  font-family: Inter;
  font-size: 16px;
  font-weight: 500;

  :hover {
    user-select: ${({ isOnSwitch }) => (isOnSwitch ? 'none' : 'initial')};
  }
`

const StyledToggle = styled.button<{ isActive?: boolean; activeElement?: boolean }>`
  border-radius: 100px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  width: fit-content;
  cursor: pointer;
  outline: none;
  padding: 4px;
`

export interface ToggleProps {
  id?: string
  isActive: boolean
  toggle: () => void
}

export default function Toggle({ id, isActive, toggle }: ToggleProps) {
  return (
    <StyledToggle id={id} isActive={isActive} onClick={toggle} aria-pressed={isActive}>
      <ToggleElement isActive={!isActive} isOnSwitch={false}>
        Off
      </ToggleElement>
      <ToggleElement isActive={isActive} isOnSwitch={true}>
        On
      </ToggleElement>
    </StyledToggle>
  )
}

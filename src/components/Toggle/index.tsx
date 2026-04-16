import styled from 'styled-components'

const ToggleElement = styled.span<{ isActive?: boolean; isOnSwitch?: boolean }>`
  padding: 5px 16px;
  border-radius: 100px;
  background: ${({ isActive }) =>
    isActive
      ? 'linear-gradient(105.56deg, #734117 1.68%, #D8A072 50%, #734017 98.32%)'
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
  background: rgba(0, 0, 0, 0.06);
  box-shadow: inset 0px 10px 14px rgba(237, 210, 188, 0.05), inset 0px 2px 16px rgba(236, 208, 186, 0.3);
  backdrop-filter: blur(12px);
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

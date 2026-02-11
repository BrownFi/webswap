import React, { ReactNode, useCallback, useState } from 'react'
import styled from 'styled-components'
import Popover, { PopoverProps } from 'components/Popover'

const TooltipContainer = styled.div`
  max-width: 480px;
  padding: 0.6rem 1rem;
  line-height: 150%;
  font-weight: 500;
  font-size: 14px;
  white-space: pre-line;
  background-color: #444444;
`

interface TooltipProps extends Omit<PopoverProps, 'content'> {
  text: ReactNode
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export default function Tooltip({ text, onMouseEnter, onMouseLeave, ...rest }: TooltipProps) {
  return (
    <Popover
      content={
        <TooltipContainer onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
          {text}
        </TooltipContainer>
      }
      {...rest}
    />
  )
}

export function MouseoverTooltip({ children, placement = 'bottom', ...rest }: Omit<TooltipProps, 'show'>) {
  const [show, setShow] = useState(false)
  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])
  return (
    <Tooltip {...rest} show={show} placement={placement} onMouseEnter={open} onMouseLeave={close}>
      <div onMouseEnter={open} onMouseLeave={close}>
        {children}
      </div>
    </Tooltip>
  )
}

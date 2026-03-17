import React, { useEffect, useState } from 'react'
import styled, { css } from 'styled-components'
import { isMobile } from 'react-device-detect'
import { transparentize } from 'polished'

const StyledDialogOverlay = styled.div<{ visible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #00000088;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 200ms ease;
`

// destructure to not pass custom props to Dialog DOM element
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StyledDialogContent = styled(({ minHeight, maxHeight, maxWidth, mobile, isOpen, ...rest }) => (
  <div {...rest} />
)).attrs({
  'aria-label': 'dialog',
})`
  overflow-y: ${({ mobile }) => (mobile ? 'scroll' : 'hidden')};

  margin: 0 0 2rem 0;
  background-color: ${({ theme }) => theme.bg1};
  box-shadow: 0 4px 8px 0 ${({ theme }) => transparentize(0.95, theme.shadow1)};
  padding: 0px;
  width: 50vw;
  overflow-y: ${({ mobile }) => (mobile ? 'scroll' : 'hidden')};
  overflow-x: hidden;

  align-self: ${({ mobile }) => (mobile ? 'flex-end' : 'center')};

  max-width: ${({ maxWidth }) => maxWidth || 600}px;
  ${({ maxHeight }) =>
    maxHeight &&
    css`
      max-height: ${maxHeight}vh;
    `}
  ${({ minHeight }) =>
    minHeight &&
    css`
      min-height: ${minHeight}vh;
    `}
  display: flex;
  border-radius: 0;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 65vw;
    margin: 0;
  `}
  ${({ theme, mobile }) => theme.mediaWidth.upToSmall`
    width: calc(100vw - 24px);
    ${mobile &&
      css`
        width: 100vw;
        border-radius: 20px;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      `}
  `}
`

interface ModalProps {
  isOpen: boolean
  onDismiss: () => void
  minHeight?: number | false
  maxHeight?: number
  maxWidth?: number
  initialFocusRef?: React.RefObject<any>
  children?: React.ReactNode
}

export function Modal({
  isOpen,
  onDismiss,
  minHeight = false,
  maxHeight = 90,
  maxWidth = 600,
  initialFocusRef,
  children,
}: ModalProps) {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
      const timer = setTimeout(() => setMounted(false), 200)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isOpen])

  if (!mounted) return null

  return (
    <StyledDialogOverlay visible={visible} onClick={onDismiss}>
      <StyledDialogContent
        role="dialog"
        aria-modal="true"
        aria-label="dialog content"
        minHeight={minHeight}
        maxHeight={maxHeight}
        maxWidth={maxWidth}
        mobile={isMobile}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* prevents the automatic focusing of inputs on mobile by the reach dialog */}
        {!initialFocusRef && isMobile ? <div tabIndex={1} /> : null}
        {children}
      </StyledDialogContent>
    </StyledDialogOverlay>
  )
}

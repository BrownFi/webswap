import { useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'react-feather'
import { Text } from 'components/Rebass'
import styled from 'styled-components'
import { ApplicationModal } from 'state/application/actions'
import { useModalOpen, useToggleSettingsMenu } from 'state/application/hooks'
import {
  useExpertModeManager,
  useUserTransactionTTL,
  useUserSlippageTolerance,
  useUserSingleHopOnly,
} from 'state/user/hooks'
import { TYPE } from 'theme'
import { ButtonError } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { Modal } from 'components/Modal'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween, RowFixed } from 'components/Row'
import Toggle from 'components/Toggle'
import TransactionSettings from 'components/TransactionSettings'
import settings from 'assets/svg/settings.svg'

const StyledCloseIcon = styled(X)`
  height: 20px;
  width: 20px;
  cursor: pointer;
  stroke: #B8ADA4;
`

const StyledMenuButton = styled.button`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  // height: 35px;

  // padding: 0.15rem 0.5rem;
  // border-radius: 0.5rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
  }

  svg {
    // margin-top: 2px;
  }
`
const EmojiWrapper = styled.div`
  position: absolute;
  bottom: -6px;
  right: 0px;
  font-size: 14px;
`

const StyledMenu = styled.div`
  margin-left: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`

const MenuFlyout = styled.span`
  min-width: 496px;
  background: #1E1915;
  border: 1px solid #2F2823;
  border-radius: 32px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-size: 1rem;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1002;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    right: auto;
    min-width: unset;
    width: calc(100% - 32px);
    max-width: 400px;
    max-height: 80vh;
    overflow-y: auto;
  `};
`

const Break = styled.div`
  width: 100%;
  height: 1px;
  background-color: #c4943a20;
`

const ModalContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  background-color: ${({ theme }) => theme.bg2};
  border-radius: 20px;
`

export function SettingsTab() {
  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.SETTINGS)
  const toggle = useToggleSettingsMenu()

  const [userSlippageTolerance, setUserslippageTolerance] = useUserSlippageTolerance()

  const [ttl, setTtl] = useUserTransactionTTL()

  const [expertMode, toggleExpertMode] = useExpertModeManager()

  const [singleHopOnly, setSingleHopOnly] = useUserSingleHopOnly()

  // show confirmation view before turning on
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleConfirmExpertMode = useCallback(() => {
    if (confirmText === 'confirm') {
      toggleExpertMode()
      setShowConfirmation(false)
      setConfirmText('')
    }
  }, [confirmText, toggleExpertMode])

  // Dismiss handled by overlay onClick — disabled useOnClickOutside since flyout is portaled
  // useOnClickOutside(node, open ? toggle : undefined)

  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <StyledMenu ref={node as any}>
      <Modal isOpen={showConfirmation} onDismiss={() => setShowConfirmation(false)} maxHeight={100}>
        <ModalContentWrapper>
          <AutoColumn>
            <RowBetween style={{ padding: '0 2rem' }}>
              <div />
              <Text fontWeight={500} fontSize={20}>
                Are you sure?
              </Text>
              <StyledCloseIcon onClick={() => setShowConfirmation(false)} aria-label="Close" />
            </RowBetween>
            <Break />
            <AutoColumn gap="lg" style={{ padding: '0 2rem' }}>
              <Text fontWeight={500} fontSize={20}>
                Expert mode turns off the confirm transaction prompt and allows high slippage trades that often result
                in bad rates and lost funds.
              </Text>
              <Text fontWeight={600} fontSize={20}>
                ONLY USE THIS MODE IF YOU KNOW WHAT YOU ARE DOING.
              </Text>
              <input
                type="text"
                placeholder='Type "confirm" to enable expert mode'
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirmExpertMode()}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #3d3425',
                  backgroundColor: '#0d0b08',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                }}
                aria-label="Type confirm to enable expert mode"
              />
              <ButtonError
                error={true}
                padding={'12px'}
                onClick={handleConfirmExpertMode}
                disabled={confirmText !== 'confirm'}
              >
                <Text fontSize={20} fontWeight={500} id="confirm-expert-mode">
                  Turn On Expert Mode
                </Text>
              </ButtonError>
            </AutoColumn>
          </AutoColumn>
        </ModalContentWrapper>
      </Modal>
      <StyledMenuButton onClick={toggle} id="open-settings-dialog-button" aria-label="Open settings">
        <div className="w-[44px] h-[44px] flex items-center justify-center rounded-[100px] transition-colors" style={{ background: '#2F2823', border: 'none', padding: '10px' }}>
          <img src={settings} alt="settings" className="w-[20px]" style={{ filter: 'brightness(0) saturate(100%) invert(73%) sepia(5%) saturate(1000%) hue-rotate(350deg) brightness(90%) contrast(85%)' }} />
        </div>

        {expertMode ? (
          <EmojiWrapper>
            <span role="img" aria-label="wizard-icon">
              🧙
            </span>
          </EmojiWrapper>
        ) : null}
      </StyledMenuButton>
      {open && createPortal(
        <>
        <div className="fixed inset-0 z-[1001] bg-black/75 backdrop-blur-sm" onClick={toggle} />
        <MenuFlyout>
            <div className="flex items-center justify-between">
              <Text style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '20px', lineHeight: '30px', color: '#FBFBFD' }}>
                Transaction Settings
              </Text>
              <button onClick={toggle} style={{ width: '24px', height: '24px', background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }} aria-label="Close settings">
                <X size={20} color="#B8ADA4" />
              </button>
            </div>
            <TransactionSettings
              rawSlippage={userSlippageTolerance}
              setRawSlippage={setUserslippageTolerance}
              deadline={ttl}
              setDeadline={setTtl}
            />
            <div className="w-full h-[1px] bg-[#2F2823]"></div>
            <Text style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '20px', lineHeight: '30px', color: '#FBFBFD' }}>
              Interface Settings
            </Text>
            <RowBetween>
              <RowFixed>
                <TYPE.black style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '16px', color: '#CFC7C1' }}>
                  Multihops
                </TYPE.black>
                <QuestionHelper text="Enable swaps through multiple token pairs." />
              </RowFixed>
              <Toggle
                id="toggle-disable-multihop-button"
                isActive={!singleHopOnly}
                toggle={() => {
                  setSingleHopOnly(!singleHopOnly)
                }}
              />
            </RowBetween>
        </MenuFlyout>
        </>,
        document.body
      )}
    </StyledMenu>

  )
}

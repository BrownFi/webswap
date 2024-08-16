import React from 'react'
import styled from 'styled-components'
import { useLastTruthy } from '../../hooks/useLast'
import { AdvancedSwapDetails, AdvancedSwapDetailsProps } from './AdvancedSwapDetails'

const AdvancedDetailsFooter = styled.div<{ show: boolean }>`
  // padding-top: calc(16px + 2rem);
  padding-bottom: 16px;
  // margin-top: -2rem;
  width: 100%;
  max-width: 500px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  color: ${({ theme }) => theme.white};
  background-color: #1d1c21;
  z-index: -1;
  padding: 0 20px 20px 20px;

  transform: ${({ show }) => (show ? 'translateY(0%)' : 'translateY(-100%)')};
  transition: transform 300ms ease-in-out;
`

export default function AdvancedSwapDetailsDropdown({ trade, ...rest }: AdvancedSwapDetailsProps) {
  const lastTrade = useLastTruthy(trade)

  return (
    <AdvancedDetailsFooter show={Boolean(trade)}>
      <AdvancedSwapDetails {...rest} trade={trade ?? lastTrade ?? undefined} />
    </AdvancedDetailsFooter>
  )
}

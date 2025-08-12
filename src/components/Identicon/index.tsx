import { useEffect, useRef } from 'react'

import Jazzicon from 'jazzicon'
import styled from 'styled-components'

import { useActiveWeb3React } from 'hooks'

const StyledIdenticonContainer = styled.div`
  height: 40px;
  width: 40px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.bg4};
  margin-right: 12px;
`

export function Identicon() {
  const ref = useRef<HTMLDivElement>()

  const { account } = useActiveWeb3React()

  useEffect(() => {
    if (account && ref.current) {
      ref.current.innerHTML = ''
      ref.current.appendChild(Jazzicon(40, parseInt(account.slice(2, 10), 40)))
    }
  }, [account])

  // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
  return <StyledIdenticonContainer ref={ref as any} />
}

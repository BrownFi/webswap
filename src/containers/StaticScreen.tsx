import { PropsWithChildren } from 'react'
import 'rc-slider/assets/index.css'
import 'theme/index.css'
import styled from 'styled-components'
import Footer from 'components/Footer'
import bgGolden from 'assets/images/bg-golden.jpg'
import Header from 'components/Header'

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  overflow-x: hidden;
  background-color: #0a0806;
  min-height: 100vh;
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  justify-content: space-between;
  min-height: 78px;
  z-index: 100;
  background-color: transparent;
`

const StaticScreen = ({ children }: PropsWithChildren) => {
  return (
    <AppWrapper className="relative">
      <img
        src={bgGolden}
        alt=""
        className="fixed inset-0 w-full h-full object-cover pointer-events-none opacity-80"
      />
      <HeaderWrapper>
        <Header />
      </HeaderWrapper>
      {children}
      <div className="flex-1" style={{ minHeight: '80px' }} />
      <Footer />
    </AppWrapper>
  )
}

export default StaticScreen

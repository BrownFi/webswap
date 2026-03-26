import { PropsWithChildren } from 'react'
import 'rc-slider/assets/index.css'
import 'theme/index.css'
import styled from 'styled-components'
import Footer from 'components/Footer'
import csm from 'assets/svg/csm.svg'
import mathImage from 'assets/svg/math-image.svg'
import Header from 'components/Header'

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  overflow-x: hidden;
  background-color: #0D0D0F;
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
  background-color: #0D0D0F;
`

const StaticScreen = ({ children }: PropsWithChildren) => {
  return (
    <AppWrapper className="relative">
      <img src={csm} alt="" className="fixed right-[40px] top-[100px] pointer-events-none" />
      <img
        src={mathImage}
        alt=""
        className="fixed left-[40px] right-[40px] bottom-[120px] pointer-events-none math-image"
      />
      <HeaderWrapper>
        <Header />
      </HeaderWrapper>
      {children}
      <div className="flex-1" />
      <Footer />
    </AppWrapper>
  )
}

export default StaticScreen

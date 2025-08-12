import React, { PropsWithChildren } from 'react'
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
  align-items: flex-start;
  overflow-x: hidden;
  background-color: #131216;
  min-height: 100vh;
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
  min-height: 78px;
`

const StaticScreen = ({ children }: PropsWithChildren) => {
  return (
    <AppWrapper className="relative">
      <img src={csm} alt="csm" className="absolute  right-[40px] top-[100px]" />
      <img src={mathImage} alt="math" className="absolute left-[40px] right-[40px] math-image bottom-[120px]" />
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

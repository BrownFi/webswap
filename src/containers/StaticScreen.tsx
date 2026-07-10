import { PropsWithChildren, useEffect, useState } from 'react'
import 'rc-slider/assets/index.css'
import 'theme/index.css'
import styled from 'styled-components'
import Footer from 'components/Footer'
import Header from 'components/Header'

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  overflow-x: hidden;
  background-color: #050505;
  min-height: 100vh;
`

function HeaderWrapper({ children }: PropsWithChildren) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'row nowrap',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        justifyContent: 'space-between',
        minHeight: '78px',
        zIndex: 100,
        backgroundColor: scrolled ? '#050505' : 'transparent',
        transition: 'background-color 300ms ease',
      }}
    >
      {children}
    </div>
  )
}

const StaticScreen = ({ children }: PropsWithChildren) => {
  // webswap's header/footer render on every route, including /clmm, so the
  // CLMM section shares the same navbar (CLMM's own Layout chrome is stripped).
  return (
    <AppWrapper className="relative">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(152, 92, 42, 0.08) 0%, transparent 60%)',
        }}
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

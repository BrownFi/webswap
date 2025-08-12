import React from 'react'

import styled from 'styled-components'

export const BodyWrapper = styled.div`
  position: relative;
  max-width: 500px;
  width: 100%;
  background: #1d1c21;
  box-shadow:
    0px 0px 1px rgba(0, 0, 0, 0.01),
    0px 4px 8px rgba(0, 0, 0, 0.04),
    0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 0;
  /* padding: 1rem; */
  padding-bottom: 32px;
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export function AppBody({ children }: { children: React.ReactNode }) {
  return <BodyWrapper>{children}</BodyWrapper>
}

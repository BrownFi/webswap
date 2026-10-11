import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

import { ChainModal } from './CustomChainSelect'
import { HEMI_CHAIN_ID } from 'connectors'

// useAccount is the only wallet hook ChainModal reads; switchChainAsync is passed
// in by the caller, so the mock just needs to exist.
const mockAccount = vi.hoisted(() => ({ chainId: undefined as number | undefined }))
vi.mock('wagmi', () => ({
  useAccount: () => mockAccount,
  useSwitchChain: () => ({ switchChainAsync: vi.fn() }),
}))

const berachain = { id: 80094, name: 'Berachain', iconUrl: 'bera.png' }
const store = configureStore({ reducer: { chain: () => berachain } })

const LocationProbe = () => <span data-testid="loc">{useLocation().pathname}</span>

const renderModal = (route: string, onSwitchChain?: (chainId: number) => void | Promise<unknown>) =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <ChainModal isOpen onClose={() => {}} onSwitchChain={onSwitchChain} />
        <LocationProbe />
      </MemoryRouter>
    </Provider>,
  )

describe('ChainModal Hemi rows', () => {
  it('lists Hemi twice — once as the V3 chain and once as the CLAMM product', () => {
    renderModal('/swap')
    expect(screen.getAllByText('Hemi')).toHaveLength(1)
    expect(screen.getAllByText('Hemi CLAMM')).toHaveLength(1)
  })

  // Regression: the handler used to fire the wallet switch and navigate in the
  // same tick. ChainRouteSync ejects from /clamm while the connected wallet is
  // not on Hemi, so the user was bounced straight back to /swap and the CLAMM
  // product was unreachable. Routing must wait for the switch to land.
  it('does not route into CLAMM until the wallet switch resolves', async () => {
    let resolveSwitch: (() => void) | undefined
    const switched = new Promise<void>((resolve) => {
      resolveSwitch = resolve
    })
    const onSwitchChain = vi.fn((_chainId: number) => switched)

    renderModal('/swap', onSwitchChain)
    await act(async () => {
      fireEvent.click(screen.getByText('Hemi CLAMM'))
    })

    expect(onSwitchChain).toHaveBeenCalledWith(HEMI_CHAIN_ID)
    // Switch still pending → must NOT have navigated yet.
    expect(screen.getByTestId('loc').textContent).toBe('/swap')

    await act(async () => {
      resolveSwitch?.()
      await switched
    })
    expect(screen.getByTestId('loc').textContent).toBe('/clamm/swap')
  })

  it('stays put when the user rejects the wallet switch', async () => {
    const onSwitchChain = vi.fn(() => Promise.reject(new Error('user rejected')))

    renderModal('/swap', onSwitchChain)
    await act(async () => {
      fireEvent.click(screen.getByText('Hemi CLAMM'))
    })

    expect(screen.getByTestId('loc').textContent).toBe('/swap')
  })
})

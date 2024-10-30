/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { EthereumProvider } from '@walletconnect/ethereum-provider'

export const URI_AVAILABLE = 'URI_AVAILABLE'

export class UserRejectedRequestError extends Error {
  public constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'The user rejected the request.'
  }
}

interface WalletConnectConnectorArguments {
  projectId: string
  chains: number[]
  rpcMap?: any
}

export class WalletConnectConnector extends AbstractConnector {
  private readonly projectId: string = 'SFM_SWAP'
  private readonly chains: number[] = [1]

  public walletConnectProvider?: any

  constructor({ projectId, chains }: WalletConnectConnectorArguments) {
    // invariant(Object.keys(rpc).length === 1, '@walletconnect/web3-provider is broken with >1 chainId, please use 1')
    super({ supportedChainIds: chains })

    this.projectId = projectId
    this.chains = chains

    this.handleChainChanged = this.handleChainChanged.bind(this)
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this)
    this.handleDisconnect = this.handleDisconnect.bind(this)
  }

  private handleChainChanged(chainId: number | string): void {
    this.emitUpdate({ chainId })
  }

  private handleAccountsChanged(accounts: string[]): void {
    this.emitUpdate({ account: accounts[0] })
  }

  private handleDisconnect(): void {
    this.emitDeactivate()
    // we have to do this because of a @walletconnect/web3-provider bug
    if (this.walletConnectProvider) {
      this.walletConnectProvider.disconnect()
      this.walletConnectProvider.removeListener('chainChanged', this.handleChainChanged)
      this.walletConnectProvider.removeListener('accountsChanged', this.handleAccountsChanged)
      this.walletConnectProvider = undefined
    }

    this.emitDeactivate()
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!this.walletConnectProvider) {
      this.walletConnectProvider = await EthereumProvider.init({
        projectId: this.projectId, // REQUIRED your projectId
        chains: [this.chains[0]], // REQUIRED chain ids
        showQrModal: true,
        optionalChains: this.chains.slice(1),
        metadata: {
          description: 'brownfi',
          icons: [''],
          name: 'Swap | Brownfi',
          url: window?.location.origin
        }
      })
    }

    this.walletConnectProvider.on('display_uri', (uri: string) => {
      // console.log('uri =====>', uri)
    })
    this.walletConnectProvider.on('disconnect', this.handleDisconnect)
    this.walletConnectProvider.on('chainChanged', this.handleChainChanged)
    this.walletConnectProvider.on('accountsChanged', this.handleAccountsChanged)

    const account = await this.walletConnectProvider
      .enable()
      .then((accounts: string[]): string => accounts[0])
      .catch((error: Error): void => {
        console.log('errror =====>', error)
        // TODO ideally this would be a better check
        if (error.message === 'User closed modal') {
          throw new UserRejectedRequestError()
        }

        throw error
      })

    setTimeout(() => {
      const pairing = localStorage.getItem('wc@2:core:0.3//pairing')
      if (pairing === '[]') {
        this.deactivate()
        localStorage.clear()
      }
    }, 1000)

    return { provider: this.walletConnectProvider, account }
  }

  public async getProvider(): Promise<any> {
    return this.walletConnectProvider
  }

  public async getChainId(): Promise<number | string> {
    return this.walletConnectProvider.chainId
  }

  public async getAccount(): Promise<null | string> {
    return this.walletConnectProvider.accounts[0]
  }

  public deactivate() {
    if (this.walletConnectProvider) {
      this.walletConnectProvider.disconnect()
      this.walletConnectProvider.removeListener('disconnect', this.handleDisconnect)
      this.walletConnectProvider.removeListener('chainChanged', this.handleChainChanged)
      this.walletConnectProvider.removeListener('accountsChanged', this.handleAccountsChanged)
    }
  }

  public async close() {
    await this.walletConnectProvider?.disconnect()
    this.walletConnectProvider.removeListener('disconnect', this.handleDisconnect)
    this.walletConnectProvider.removeListener('chainChanged', this.handleChainChanged)
    this.walletConnectProvider.removeListener('accountsChanged', this.handleAccountsChanged)
  }

  public request({ method, params }: { method: string; params?: any }) {
    this.walletConnectProvider?.request({
      method,
      params
    })
  }
}

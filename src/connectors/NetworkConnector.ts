import { ExternalProvider, Web3Provider } from '@ethersproject/providers'
import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'
import invariant from 'tiny-invariant'

interface NetworkConnectorArguments {
  urls: { [chainId: number]: string | string[] }
  defaultChainId?: number
}

// taken from ethers.js, compatible interface with web3 provider
type AsyncSendable = {
  isMetaMask?: boolean
  host?: string
  path?: string
  sendAsync?: (request: any, callback: (error: any, response: any) => void) => void
  send?: (request: any, callback: (error: any, response: any) => void) => void
}

class RequestError extends Error {
  constructor(message: string, public code: number, public data?: unknown) {
    super(message)
  }
}

interface BatchItem {
  request: { jsonrpc: '2.0'; id: number; method: string; params: unknown }
  resolve: (result: any) => void
  reject: (error: Error) => void
}

class MiniRpcProvider implements AsyncSendable {
  public readonly chainId: number
  public readonly urls: string[]
  public readonly batchWaitTimeMs: number

  private urlIndex = 1
  private nextId = 1
  private batchTimeoutId: ReturnType<typeof setTimeout> | null = null
  private batch: BatchItem[] = []

  constructor(chainId: number, urls: string[] | string, batchWaitTimeMs?: number) {
    this.chainId = chainId
    this.urls = Array.isArray(urls) ? urls : [urls]
    this.batchWaitTimeMs = batchWaitTimeMs ?? 50
  }

  private get currentUrl() {
    return this.urls[this.urlIndex] ?? this.urls[0]
  }

  private nextUrl() {
    this.urlIndex = (this.urlIndex + 1) % this.urls.length
    console.warn('4. Rotate to the next RPC', this.chainId, this.currentUrl)
  }

  public readonly clearBatch = async () => {
    const batch = this.batch
    this.batch = []
    this.batchTimeoutId = null

    for (let attempt = 0; attempt < this.urls.length; attempt++) {
      try {
        const response = await fetch(this.currentUrl, {
          method: 'POST',
          headers: { 'content-type': 'application/json', accept: 'application/json' },
          body: JSON.stringify(batch.map((item) => item.request)),
        })

        if (!response.ok) {
          throw new RequestError(`${response.status}: ${response.statusText}`, -32000)
        }

        const json = await response.json()
        const results = Array.isArray(json) ? json : [json]

        const byKey = batch.reduce<{ [id: number]: BatchItem }>((memo, current) => {
          memo[current.request.id] = current
          return memo
        }, {})

        let hasError = false

        for (const result of results) {
          const {
            resolve,
            reject,
            request: { method },
          } = byKey[result.id]

          if ('error' in result) {
            hasError = true
            reject(new RequestError(result.error.message, result.error.code, result.error.data))
          } else if ('result' in result) {
            resolve(result.result)
          } else {
            hasError = true
            reject(new RequestError(`Unexpected response to ${method}`, -32000, result))
          }
        }

        if (hasError) {
          // rotate và thử lại batch với URL khác
          this.nextUrl()
          continue
        }

        // Thành công toàn bộ => return
        return
      } catch (error) {
        console.warn(`[RPC] Failed ${this.currentUrl}:`, error)
        this.nextUrl()
        if (attempt === this.urls.length - 1) {
          batch.forEach(({ reject }) => reject(new Error(`All RPC URLs failed for chain ${this.chainId}`)))
        }
      }
    }
  }

  public readonly sendAsync = (
    request: { jsonrpc: '2.0'; id: number | string | null; method: string; params?: unknown[] | object },
    callback: (error: any, response: any) => void,
  ): void => {
    this.request(request.method, request.params)
      .then((result) => callback(null, { jsonrpc: '2.0', id: request.id, result }))
      .catch((error) => callback(error, null))
  }

  public readonly request = async (
    method: string | { method: string; params: unknown[] },
    params?: unknown[] | object,
  ): Promise<unknown> => {
    if (typeof method !== 'string') {
      return this.request(method.method, method.params)
    }

    if (method === 'eth_chainId') {
      return `0x${this.chainId.toString(16)}`
    }

    const promise = new Promise((resolve, reject) => {
      this.batch.push({
        request: {
          jsonrpc: '2.0',
          id: this.nextId++,
          method,
          params,
        },
        resolve,
        reject,
      })
    })

    this.batchTimeoutId = this.batchTimeoutId ?? setTimeout(this.clearBatch, this.batchWaitTimeMs)
    return promise
  }
}

export class NetworkConnector extends AbstractConnector {
  private readonly providers: { [chainId: number]: MiniRpcProvider }
  private currentChainId: number

  constructor({ urls, defaultChainId }: NetworkConnectorArguments) {
    invariant(defaultChainId || Object.keys(urls).length === 1, 'defaultChainId is a required argument with >1 url')
    super({ supportedChainIds: Object.keys(urls).map((k): number => Number(k)) })

    this.currentChainId = defaultChainId || Number(Object.keys(urls)[0])
    this.providers = Object.keys(urls).reduce<{ [chainId: number]: MiniRpcProvider }>((accumulator, chainId) => {
      accumulator[Number(chainId)] = new MiniRpcProvider(Number(chainId), urls[Number(chainId)])
      return accumulator
    }, {})
  }

  public get provider(): MiniRpcProvider {
    return this.providers[this.currentChainId]
  }

  public getEthersProvider(): Web3Provider {
    return new Web3Provider((this.provider as unknown) as ExternalProvider, 'any')
  }

  public async activate(): Promise<ConnectorUpdate> {
    return { provider: this.providers[this.currentChainId], chainId: this.currentChainId, account: null }
  }

  public async getProvider(): Promise<MiniRpcProvider> {
    return this.providers[this.currentChainId]
  }

  public async getChainId(): Promise<number> {
    return this.currentChainId
  }

  public async getAccount(): Promise<null> {
    return null
  }

  public deactivate() {
    return
  }
}

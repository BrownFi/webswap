import JSBI from 'jsbi'
import invariant from 'tiny-invariant'
import { getCreate2Address } from '@ethersproject/address'
import { keccak256, pack } from '@ethersproject/solidity'
import { ChainId } from '../constants/chainId'
import {
  BigintIsh,
  ZERO,
  ONE,
  FIVE,
  _997,
  _1000,
  MINIMUM_LIQUIDITY,
} from '../constants/types'
import {
  parseBigintIsh,
  sqrt,
  getFactoryAddress,
  getInitCodeHash,
  isContractWithPrice,
  getRouterAddress,
} from '../utils'
import { RPC_URLS, ROUTER_ADDRESS_WITH_PRICE, PYTH_ADDRESS } from '../constants/addresses'

// Helper: fetch Pyth price feed data and update fee for WithPrice router calls
async function getFeedPriceAndFee(pairs: Pair[], chainId: number): Promise<[string[], number]> {
  const { default: Web3 } = await import('web3')
  const web3 = new Web3(new (Web3 as any).providers.HttpProvider(RPC_URLS[chainId]))
  const IPair = [
    { inputs: [], name: 'priceFeed', outputs: [{ type: 'address' }], stateMutability: 'view', type: 'function' },
  ]
  const IPythPriceFeed = [
    { inputs: [], name: 'baseTokenPriceId', outputs: [{ type: 'bytes32' }], stateMutability: 'view', type: 'function' },
    { inputs: [], name: 'quoteTokenPriceId', outputs: [{ type: 'bytes32' }], stateMutability: 'view', type: 'function' },
  ]
  const IPyth = [
    { inputs: [{ type: 'bytes[]' }], name: 'getUpdateFee', outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' },
  ]

  const allIds = (await Promise.all(pairs.map(async (pair) => {
    const pairContract = new web3.eth.Contract(IPair as any, pair.liquidityToken.address)
    const priceFeedAddress = await (pairContract.methods as any).priceFeed().call()
    const pf = new web3.eth.Contract(IPythPriceFeed as any, priceFeedAddress)
    const [base, quote] = await Promise.all([
      (pf.methods as any).baseTokenPriceId().call(),
      (pf.methods as any).quoteTokenPriceId().call(),
    ])
    return [base, quote]
  }))).flat()

  const uniqueIds = allIds.filter((id, i, arr) => arr.indexOf(id) === i && id !== ZERO_ADDRESS)
  const { default: axios } = await import('axios')
  const { data } = await axios.get('https://hermes.pyth.network/api/latest_vaas', { params: { ids: uniqueIds } })
  const priceUpdate = (data as string[]).map((vaa: string) => '0x' + Buffer.from(vaa, 'base64').toString('hex'))

  const pythContract = new web3.eth.Contract(IPyth as any, PYTH_ADDRESS[chainId])
  const updateFee = await (pythContract.methods as any).getUpdateFee(priceUpdate).call()
  return [priceUpdate, +updateFee]
}

// Helper: fetch Pyth price update data and encode for V2 router
async function solidityPackHelper(addresses: string[], chainId: number): Promise<string> {
  const { default: Web3 } = await import('web3')
  const web3 = new Web3(new (Web3 as any).providers.HttpProvider(RPC_URLS[chainId]))
  const IFactoryV2 = [
    { inputs: [{ type: 'address' }], name: 'priceFeedIds', outputs: [{ type: 'bytes32' }], stateMutability: 'view', type: 'function' },
  ]
  const { getFactoryAddress: getFactory } = await import('../utils')
  const factoryContract = new web3.eth.Contract(IFactoryV2 as any, getFactory(chainId, 2))
  const priceFeedIds = await Promise.all(addresses.map((addr) => (factoryContract.methods as any).priceFeedIds(addr).call()))
  const { default: axios } = await import('axios')
  const { data } = await axios.get('https://hermes.pyth.network/v2/updates/price/latest', { params: { ids: priceFeedIds } })
  const dataBytes = (data.binary.data as string[]).map((b: string) => `0x${b}`)
  const { utils } = await import('ethers')
  return utils.defaultAbiCoder.encode(['bytes[]'], [dataBytes])
}
import { Token } from './token'
import { Price } from './fractions/price'
import { TokenAmount } from './fractions/tokenAmount'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000000000000000000000000000'

class InsufficientReservesError extends Error {
  public readonly isInsufficientReservesError = true
  constructor() {
    super('INSUFFICIENT_RESERVES')
    this.name = 'InsufficientReservesError'
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, InsufficientReservesError.prototype)
    }
  }
}

class InsufficientInputAmountError extends Error {
  public readonly isInsufficientInputAmountError = true
  constructor() {
    super('INSUFFICIENT_INPUT_AMOUNT')
    this.name = 'InsufficientInputAmountError'
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, InsufficientInputAmountError.prototype)
    }
  }
}

let PAIR_ADDRESS_CACHE: Record<string, Record<string, string>> = {}

export class Pair {
  public readonly liquidityToken: Token
  public readonly tokenAmounts: [TokenAmount, TokenAmount]
  public readonly version: number

  static getAddress(tokenA: Token, tokenB: Token, version: number): string {
    const tokens = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]

    if (PAIR_ADDRESS_CACHE?.[tokens[0].address]?.[tokens[1].address] === undefined) {
      PAIR_ADDRESS_CACHE = {
        ...PAIR_ADDRESS_CACHE,
        [tokens[0].address]: {
          ...PAIR_ADDRESS_CACHE?.[tokens[0].address],
          [tokens[1].address]: getCreate2Address(
            getFactoryAddress(tokenA.chainId, version),
            keccak256(['bytes'], [pack(['address', 'address'], [tokens[0].address, tokens[1].address])]),
            getInitCodeHash(tokenA.chainId, version)
          ),
        },
      }
    }

    return PAIR_ADDRESS_CACHE[tokens[0].address][tokens[1].address]
  }

  constructor(tokenAmountA: TokenAmount, tokenAmountB: TokenAmount, version: number) {
    const tokenAmounts: [TokenAmount, TokenAmount] = tokenAmountA.token.sortsBefore(tokenAmountB.token)
      ? [tokenAmountA, tokenAmountB]
      : [tokenAmountB, tokenAmountA]
    const symbol = version === 2 ? 'BF-V2' : 'BRF-V1'
    const name = version === 2 ? 'BrownFi V2' : 'BrownFi V1'
    this.liquidityToken = new Token(
      tokenAmounts[0].token.chainId,
      Pair.getAddress(tokenAmounts[0].token, tokenAmounts[1].token, version),
      18,
      symbol,
      name
    )
    this.tokenAmounts = tokenAmounts
    this.version = version
  }

  /**
   * Returns true if the token is either token0 or token1
   * @param token to check
   */
  involvesToken(token: Token): boolean {
    return token.equals(this.token0) || token.equals(this.token1)
  }

  /**
   * Returns the current mid price of the pair in terms of token0, i.e. the ratio of reserve1 to reserve0
   */
  get token0Price(): Price {
    return new Price(this.token0, this.token1, this.tokenAmounts[0].raw, this.tokenAmounts[1].raw)
  }

  /**
   * Returns the current mid price of the pair in terms of token1, i.e. the ratio of reserve0 to reserve1
   */
  get token1Price(): Price {
    return new Price(this.token1, this.token0, this.tokenAmounts[1].raw, this.tokenAmounts[0].raw)
  }

  /**
   * Return the price of the given token in terms of the other token in the pair.
   * @param token token to return price of
   */
  priceOf(token: Token): Price {
    invariant(this.involvesToken(token), 'TOKEN')
    return token.equals(this.token0) ? this.token0Price : this.token1Price
  }

  /**
   * Returns the chain ID of the tokens in the pair.
   */
  get chainId(): ChainId {
    return this.token0.chainId
  }

  get token0(): Token {
    return this.tokenAmounts[0].token
  }

  get token1(): Token {
    return this.tokenAmounts[1].token
  }

  get reserve0(): TokenAmount {
    return this.tokenAmounts[0]
  }

  get reserve1(): TokenAmount {
    return this.tokenAmounts[1]
  }

  reserveOf(token: Token): TokenAmount {
    invariant(this.involvesToken(token), 'TOKEN')
    return token.equals(this.token0) ? this.reserve0 : this.reserve1
  }

  getOutputAmount(inputAmount: TokenAmount): [TokenAmount, Pair] {
    invariant(this.involvesToken(inputAmount.token), 'TOKEN')
    if (JSBI.equal(this.reserve0.raw, ZERO) || JSBI.equal(this.reserve1.raw, ZERO)) {
      throw new InsufficientReservesError()
    }

    const inputReserve = this.reserveOf(inputAmount.token)
    const outputReserve = this.reserveOf(inputAmount.token.equals(this.token0) ? this.token1 : this.token0)

    const inputAmountWithFee = JSBI.multiply(inputAmount.raw, _997)
    const numerator = JSBI.multiply(inputAmountWithFee, outputReserve.raw)
    const denominator = JSBI.add(JSBI.multiply(inputReserve.raw, _1000), inputAmountWithFee)

    const outputAmount = new TokenAmount(
      inputAmount.token.equals(this.token0) ? this.token1 : this.token0,
      JSBI.divide(numerator, denominator)
    )

    if (JSBI.equal(outputAmount.raw, ZERO)) {
      throw new InsufficientInputAmountError()
    }

    return [outputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount), this.version)]
  }

  getInputAmount(outputAmount: TokenAmount): [TokenAmount, Pair] {
    invariant(this.involvesToken(outputAmount.token), 'TOKEN')
    if (
      JSBI.equal(this.reserve0.raw, ZERO) ||
      JSBI.equal(this.reserve1.raw, ZERO) ||
      JSBI.greaterThanOrEqual(outputAmount.raw, this.reserveOf(outputAmount.token).raw)
    ) {
      throw new InsufficientReservesError()
    }

    const outputReserve = this.reserveOf(outputAmount.token)
    const inputReserve = this.reserveOf(outputAmount.token.equals(this.token0) ? this.token1 : this.token0)

    const numerator = JSBI.multiply(JSBI.multiply(inputReserve.raw, outputAmount.raw), _1000)
    const denominator = JSBI.multiply(JSBI.subtract(outputReserve.raw, outputAmount.raw), _997)

    const inputAmount = new TokenAmount(
      outputAmount.token.equals(this.token0) ? this.token1 : this.token0,
      JSBI.add(JSBI.divide(numerator, denominator), ONE)
    )

    return [inputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount), this.version)]
  }

  async getOutputAmountAsync(
    inputAmount: TokenAmount,
    pairs: Pair[],
    path: Token[],
    chainId: ChainId,
    account: string
  ): Promise<[TokenAmount, Pair, string[], number, number]> {
    const version = pairs[0].version
    invariant(this.involvesToken(inputAmount.token), 'TOKEN')
    if (JSBI.equal(this.reserve0.raw, ZERO) || JSBI.equal(this.reserve1.raw, ZERO)) {
      throw new InsufficientReservesError()
    }

    const inputReserve = this.reserveOf(inputAmount.token)
    const outputReserve = this.reserveOf(inputAmount.token.equals(this.token0) ? this.token1 : this.token0)

    const { default: Web3 } = await import('web3')
    const web3 = new Web3(new (Web3 as any).providers.HttpProvider(RPC_URLS[chainId]))
    const pathAddresses = path.map((t: Token) => t.address)

    let priceUpdate: string[] = []
    let updateFee = 0
    let amountOuts: any

    if (isContractWithPrice(chainId, version)) {
      const IRouterWithPrice = [
        { inputs: [{ type: 'uint256' }, { type: 'address[]' }, { type: 'bytes[]' }], name: 'getAmountsOutWithPrice', outputs: [{ type: 'uint256[]' }], stateMutability: 'payable', type: 'function' },
      ]
      const routerContract = new web3.eth.Contract(IRouterWithPrice as any, ROUTER_ADDRESS_WITH_PRICE[chainId])
      const feedResult = await getFeedPriceAndFee(pairs, chainId)
      priceUpdate = feedResult[0]
      updateFee = feedResult[1]
      amountOuts = await (routerContract.methods as any).getAmountsOutWithPrice(inputAmount.raw.toString(), pathAddresses, priceUpdate).call({ value: updateFee, from: account })
    } else if (version === 2) {
      const IRouterV2 = [
        { inputs: [{ type: 'uint256' }, { type: 'address[]' }, { type: 'bytes' }], name: 'getAmountsOut', outputs: [{ type: 'uint256[]' }], stateMutability: 'nonpayable', type: 'function' },
      ]
      const routerContract = new web3.eth.Contract(IRouterV2 as any, getRouterAddress(chainId, version))
      const updateData = await solidityPackHelper(pathAddresses, chainId)
      amountOuts = await (routerContract.methods as any).getAmountsOut(inputAmount.raw.toString(), pathAddresses, updateData).call({ from: account })
    } else {
      const IRouterV1 = [
        { inputs: [{ type: 'uint256' }, { type: 'address[]' }], name: 'getAmountsOut', outputs: [{ type: 'uint256[]' }], stateMutability: 'view', type: 'function' },
      ]
      const routerContract = new web3.eth.Contract(IRouterV1 as any, getRouterAddress(chainId, version))
      amountOuts = await (routerContract.methods as any).getAmountsOut(inputAmount.raw.toString(), pathAddresses).call()
    }

    const outputAmount = new TokenAmount(outputReserve.token, amountOuts[amountOuts.length - 1])
    if (JSBI.equal(outputAmount.raw, ZERO)) {
      throw new InsufficientInputAmountError()
    }

    const ratio = outputAmount.divide(outputReserve.subtract(outputAmount)).toSignificant(6)
    const priceImpactK = 0.001 * Number(ratio) * 100

    return [outputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount), version), priceUpdate, updateFee, priceImpactK]
  }

  async getInputAmountAsync(
    outputAmount: TokenAmount,
    pairs: Pair[],
    path: Token[],
    chainId: ChainId,
    account: string
  ): Promise<[TokenAmount, Pair, string[], number, number]> {
    const version = pairs[0].version
    invariant(this.involvesToken(outputAmount.token), 'TOKEN')
    if (JSBI.equal(this.reserve0.raw, ZERO) || JSBI.equal(this.reserve1.raw, ZERO) ||
        JSBI.greaterThanOrEqual(outputAmount.raw, this.reserveOf(outputAmount.token).raw)) {
      throw new InsufficientReservesError()
    }

    const outputReserve = this.reserveOf(outputAmount.token)
    const inputReserve = this.reserveOf(outputAmount.token.equals(this.token0) ? this.token1 : this.token0)

    const { default: Web3 } = await import('web3')
    const web3 = new Web3(new (Web3 as any).providers.HttpProvider(RPC_URLS[chainId]))
    const pathAddresses = path.map((t: Token) => t.address)

    let priceUpdate: string[] = []
    let updateFee = 0
    let amountIns: any

    if (isContractWithPrice(chainId, version)) {
      const IRouterWithPrice = [
        { inputs: [{ type: 'uint256' }, { type: 'address[]' }, { type: 'bytes[]' }], name: 'getAmountsInWithPrice', outputs: [{ type: 'uint256[]' }], stateMutability: 'payable', type: 'function' },
      ]
      const routerContract = new web3.eth.Contract(IRouterWithPrice as any, ROUTER_ADDRESS_WITH_PRICE[chainId])
      const feedResult = await getFeedPriceAndFee(pairs, chainId)
      priceUpdate = feedResult[0]
      updateFee = feedResult[1]
      amountIns = await (routerContract.methods as any).getAmountsInWithPrice(outputAmount.raw.toString(), pathAddresses, priceUpdate).call({ value: updateFee, from: account })
    } else if (version === 2) {
      const IRouterV2 = [
        { inputs: [{ type: 'uint256' }, { type: 'address[]' }, { type: 'bytes' }], name: 'getAmountsIn', outputs: [{ type: 'uint256[]' }], stateMutability: 'nonpayable', type: 'function' },
      ]
      const routerContract = new web3.eth.Contract(IRouterV2 as any, getRouterAddress(chainId, version))
      const updateData = await solidityPackHelper(pathAddresses, chainId)
      amountIns = await (routerContract.methods as any).getAmountsIn(outputAmount.raw.toString(), pathAddresses, updateData).call({ from: account })
    } else {
      const IRouterV1 = [
        { inputs: [{ type: 'uint256' }, { type: 'address[]' }], name: 'getAmountsIn', outputs: [{ type: 'uint256[]' }], stateMutability: 'view', type: 'function' },
      ]
      const routerContract = new web3.eth.Contract(IRouterV1 as any, getRouterAddress(chainId, version))
      amountIns = await (routerContract.methods as any).getAmountsIn(outputAmount.raw.toString(), pathAddresses).call()
    }

    const inputAmountResult = new TokenAmount(inputReserve.token, amountIns[0])
    const ratio = outputAmount.divide(outputReserve.subtract(outputAmount)).toSignificant(6)
    const priceImpactK = 0.001 * Number(ratio) * 100

    return [inputAmountResult, new Pair(inputReserve.add(inputAmountResult), outputReserve.subtract(outputAmount), version), priceUpdate, updateFee, priceImpactK]
  }

  getLiquidityMinted(totalSupply: TokenAmount, tokenAmountA: TokenAmount, tokenAmountB: TokenAmount): TokenAmount {
    invariant(totalSupply.token.equals(this.liquidityToken), 'LIQUIDITY')
    const tokenAmounts = tokenAmountA.token.sortsBefore(tokenAmountB.token)
      ? [tokenAmountA, tokenAmountB]
      : [tokenAmountB, tokenAmountA]
    invariant(
      tokenAmounts[0].token.equals(this.token0) && tokenAmounts[1].token.equals(this.token1),
      'TOKEN'
    )

    let liquidity: JSBI
    if (JSBI.equal(totalSupply.raw, ZERO)) {
      liquidity = JSBI.subtract(sqrt(JSBI.multiply(tokenAmounts[0].raw, tokenAmounts[1].raw)), MINIMUM_LIQUIDITY)
    } else {
      const amount0 = JSBI.divide(JSBI.multiply(tokenAmounts[0].raw, totalSupply.raw), this.reserve0.raw)
      const amount1 = JSBI.divide(JSBI.multiply(tokenAmounts[1].raw, totalSupply.raw), this.reserve1.raw)
      liquidity = JSBI.lessThanOrEqual(amount0, amount1) ? amount0 : amount1
    }

    if (!JSBI.greaterThan(liquidity, ZERO)) {
      throw new InsufficientInputAmountError()
    }

    return new TokenAmount(this.liquidityToken, liquidity)
  }

  getLiquidityValue(
    token: Token,
    totalSupply: TokenAmount,
    liquidity: TokenAmount,
    feeOn: boolean = false,
    kLast?: BigintIsh
  ): TokenAmount {
    invariant(this.involvesToken(token), 'TOKEN')
    invariant(totalSupply.token.equals(this.liquidityToken), 'TOTAL_SUPPLY')
    invariant(liquidity.token.equals(this.liquidityToken), 'LIQUIDITY')
    invariant(JSBI.lessThanOrEqual(liquidity.raw, totalSupply.raw), 'LIQUIDITY')

    let totalSupplyAdjusted: TokenAmount
    if (!feeOn) {
      totalSupplyAdjusted = totalSupply
    } else {
      invariant(!!kLast, 'K_LAST')
      const kLastParsed = parseBigintIsh(kLast!)
      if (!JSBI.equal(kLastParsed, ZERO)) {
        const rootK = sqrt(JSBI.multiply(this.reserve0.raw, this.reserve1.raw))
        const rootKLast = sqrt(kLastParsed)
        if (JSBI.greaterThan(rootK, rootKLast)) {
          const numerator = JSBI.multiply(totalSupply.raw, JSBI.subtract(rootK, rootKLast))
          const denominator = JSBI.add(JSBI.multiply(rootK, FIVE), rootKLast)
          const feeLiquidity = JSBI.divide(numerator, denominator)
          totalSupplyAdjusted = totalSupply.add(new TokenAmount(this.liquidityToken, feeLiquidity))
        } else {
          totalSupplyAdjusted = totalSupply
        }
      } else {
        totalSupplyAdjusted = totalSupply
      }
    }

    return new TokenAmount(
      token,
      JSBI.divide(JSBI.multiply(liquidity.raw, this.reserveOf(token).raw), totalSupplyAdjusted.raw)
    )
  }
}

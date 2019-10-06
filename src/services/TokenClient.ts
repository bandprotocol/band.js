import _ from 'lodash'
import Web3 from 'web3'
import BN from 'bn.js'
import BaseClient from './BaseClient'
import Txgen from './Txgen'
import InternalUtils from './InternalUtils'

import { Address, SendToken, BuySellType } from '../typing/index'

export default class TokenClient extends BaseClient {
  private bandAddress: Address
  private tokenAddress: Address
  private curveAddress: Address

  constructor(args: {
    bandAddress: Address
    tokenAddress: Address
    curveAddress: Address
    web3?: Web3
  }) {
    super(args.web3)
    this.bandAddress = args.bandAddress
    this.tokenAddress = args.tokenAddress
    this.curveAddress = args.curveAddress
  }

  async getBuyPrice(amount: string | BN): Promise<BN> {
    if (!this.web3) {
      return InternalUtils.throw('Required provider.')
    }
    const amountString = BN.isBN(amount) ? amount.toString() : amount
    return this.web3.eth.abi.decodeParameter(
      'uint256',
      await this.web3.eth.call({
        to: this.curveAddress,
        data: Txgen.createTransactionData(
          'getBuyPrice(uint256)',
          ['uint256'],
          [amountString],
        ),
        gas: 1000000,
      }),
    ) as BN
  }

  async getSellPrice(amount: string | BN): Promise<BN> {
    if (!this.web3) {
      return InternalUtils.throw('Required provider.')
    }
    const amountString = BN.isBN(amount) ? amount.toString() : amount
    return this.web3.eth.abi.decodeParameter(
      'uint256',
      await this.web3.eth.call({
        to: this.curveAddress,
        data: Txgen.createTransactionData(
          'getSellPrice(uint256)',
          ['uint256'],
          [amountString],
        ),
        gas: 1000000,
      }),
    ) as BN
  }

  async createTransferTransaction({ to, value }: SendToken) {
    const valueString = BN.isBN(value) ? value.toString() : value
    return this.createTransaction(
      this.tokenAddress,
      Txgen.createTransactionData(
        'transfer(address,uint256)',
        ['address', 'uint256'],
        [to, valueString],
      ),
    )
  }

  async createBuyTransaction({ amount, priceLimit }: BuySellType) {
    const amountString = BN.isBN(amount) ? amount.toString() : amount
    const priceLimitString = BN.isBN(priceLimit)
      ? priceLimit.toString()
      : priceLimit
    return this.createTransaction(
      this.bandAddress,
      Txgen.createTransferAndCall(
        this.curveAddress,
        priceLimitString,
        'buy(address,uint256,uint256)',
        ['uint256'],
        [amountString],
      ),
    )
  }

  async createSellTransaction({ amount, priceLimit }: BuySellType) {
    const amountString = BN.isBN(amount) ? amount.toString() : amount
    const priceLimitString = BN.isBN(priceLimit)
      ? priceLimit.toString()
      : priceLimit
    return this.createTransaction(
      this.tokenAddress,
      Txgen.createTransferAndCall(
        this.curveAddress,
        amountString,
        'sell(address,uint256,uint256)',
        ['uint256'],
        [priceLimitString],
      ),
    )
  }
}

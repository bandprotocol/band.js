import _ from 'lodash'
import Web3 from 'web3'
import BN from 'bn.js'
// import delay from 'delay'
import BaseClient from './BaseClient'
import ParameterClient from './ParameterClient'
import TCRClient from './TCRClient'
import InternalUtils from './InternalUtils'
import TCDClient from './TCDClient'
import {
  Address,
  SendToken,
  BuySellType,
  ParameterProposal,
  CastVote,
} from '../typing/index'

export default class CommunityClient extends BaseClient {
  private tokenAddress: Address
  private parameterAddress: Address
  private curveAddress: Address

  constructor(
    tokenAddress: Address,
    parameterAddress: Address,
    curveAddress: Address,
    web3?: Web3,
  ) {
    super(web3)
    this.tokenAddress = tokenAddress
    this.parameterAddress = parameterAddress
    this.curveAddress = curveAddress
  }

  async getBuyPrice(amount: string | BN): Promise<BN> {
    const amountString = BN.isBN(amount) ? amount.toString() : amount
    const url = `/buy-price/${amountString}`
    return new BN((await this.getRequestCurve(url)).price)
  }

  async getSellPrice(amount: string | BN): Promise<BN> {
    const amountString = BN.isBN(amount) ? amount.toString() : amount
    const url = `/sell-price/${amountString}`
    return new BN((await this.getRequestCurve(url)).price)
  }

  async createTransferTransaction({ to, value }: SendToken) {
    const valueString = BN.isBN(value) ? value.toString() : value
    const { to: tokenAddress, data } = await this.postRequestToken(
      '/transfer',
      {
        to: to,
        value: valueString,
      },
    )
    return this.createTransaction(tokenAddress, data)
  }

  async createBuyTransaction({ amount, priceLimit }: BuySellType) {
    const amountString = BN.isBN(amount) ? amount.toString() : amount
    const priceLimitString = BN.isBN(priceLimit)
      ? priceLimit.toString()
      : priceLimit
    const { to: tokenAddress, data } = await this.postRequestCurve('/buy', {
      value: amountString,
      priceLimit: priceLimitString,
    })
    return this.createTransaction(tokenAddress, data)
  }

  async createSellTransaction({ amount, priceLimit }: BuySellType) {
    const amountString = BN.isBN(amount) ? amount.toString() : amount
    const priceLimitString = BN.isBN(priceLimit)
      ? priceLimit.toString()
      : priceLimit
    const { to: tokenAddress, data } = await this.postRequestCurve('/sell', {
      value: amountString,
      priceLimit: priceLimitString,
    })
    return this.createTransaction(tokenAddress, data)
  }

  async createProposeTransaction({
    reasonHash,
    keys,
    values,
  }: ParameterProposal) {
    return this.parameter().createProposalTransaction(reasonHash, keys, values)
  }

  async createProposalVoteTransaction({ proposalId, isAccepted }: CastVote) {
    return this.parameter().createCastVoteTransaction(proposalId, isAccepted)
  }

  parameter() {
    return new ParameterClient(this.parameterAddress, this.web3)
  }

  tcr(tcrAddress: Address) {
    return new TCRClient(tcrAddress, this.web3)
  }

  tcd(tcdAddress: Address) {
    return new TCDClient(tcdAddress, this.web3)
  }

  private async getRequestCurve(path: string, params?: any): Promise<any> {
    return await InternalUtils.getRequest(
      `/token/${this.curveAddress}${path}`,
      params,
    )
  }

  private async postRequestCurve(path: string, data: any): Promise<any> {
    return await InternalUtils.postRequest(
      `/token/${this.curveAddress}${path}`,
      data,
    )
  }

  private async postRequestToken(path: string, data: any): Promise<any> {
    return await InternalUtils.postRequest(
      `/token/${this.tokenAddress}${path}`,
      data,
    )
  }
}

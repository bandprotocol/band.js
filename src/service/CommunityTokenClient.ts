import Web3 from 'web3'
import BaseClient from './BaseClient'
import BN from 'bn.js'
import config from '../config'
import { JsonResponse, OrderHistory, Address } from '../typing/index'
import axios from 'axios'
import _ from 'lodash'

export default class CommunityTokenClient extends BaseClient {
  private coreAddress?: Address

  constructor(web3?: Web3, coreAddress?: Address) {
    super(web3)
    this.coreAddress = coreAddress
  }

  private async getRequest(path: string, params?: any): Promise<any> {
    const url = config.api + '/dapps/' + this.coreAddress + path
    const response = await axios.get<JsonResponse>(url, { params })
    if (response.data.message !== undefined) {
      return this.throw(response.data.message)
    }
    return response.data.result
  }

  private async postRequest(path: string, data: any): Promise<any> {
    const url = config.api + '/dapps/' + this.coreAddress + path
    const response = await axios.post<JsonResponse>(url, data)
    if (response.data.message !== undefined) {
      return this.throw(response.data.message)
    }
    return response.data.result
  }

  private async getRequestMerkle(path: string, params?: any): Promise<any> {
    const url = config.api + '/merkle' + path
    const response = await axios.get<JsonResponse>(url, { params })
    if (response.data.message !== undefined) throw Error(response.data.message)
    return response.data.result
  }

  private async postRequestMerkle(path: string, data: any): Promise<any> {
    const url = config.api + '/merkle' + path
    const response = await axios.post<JsonResponse>(url, data)
    if (response.data.message !== undefined) throw Error(response.data.message)
    return response.data.result
  }

  async getBalance(): Promise<BN> {
    const account = await this.getAccount()
    const result = await this.getRequest(`/balance/${account}`)
    return new BN(result.balance)
  }

  async getBuyPrice(amount: string | BN): Promise<BN> {
    const amountString = BN.isBN(amount) ? amount.toString() : amount
    const url = `/buy-price/${amountString}`
    return new BN((await this.getRequest(url)).price)
  }

  async getSellPrice(amount: string | BN): Promise<BN> {
    const amountString = BN.isBN(amount) ? amount.toString() : amount
    const url = `/sell-price/${amountString}`
    return new BN((await this.getRequest(url)).price)
  }

  async getOrderHistory(args: {
    limit?: number
    user?: Address
    type?: 'buy' | 'sell'
  }): Promise<OrderHistory[]> {
    const result: any[] = await this.getRequest('/order-history', args)
    return result.map((e: OrderHistory) => ({
      ...e,
      value: new BN(e.value),
      price: new BN(e.price),
    }))
  }

  async reportDetail({
    name,
    symbol,
    logo,
    description,
    website,
  }: {
    name: string
    symbol: string
    logo: string
    description: string
    website: string
  }) {
    // report to server
    await this.postRequest(`/detail`, {
      name,
      symbol,
      logo,
      description,
      website,
    })
  }

  async transfer(to: Address, value: string | BN) {
    const valueString = BN.isBN(value) ? value.toString() : value
    const { to: tokenAddress, data } = await this.postRequest('/transfer', {
      to: to,
      value: valueString,
    })

    return this.sendTransaction(tokenAddress, data)
  }

  async buy(amount: string | BN, priceLimit: string | BN) {
    const amountString = BN.isBN(amount) ? amount.toString() : amount
    const priceLimitString = BN.isBN(priceLimit)
      ? priceLimit.toString()
      : priceLimit
    const { to: tokenAddress, data } = await this.postRequest('/buy', {
      value: amountString,
      price_limit: priceLimitString,
    })
    return this.sendTransaction(tokenAddress, data)
  }

  async sell(amount: string | BN, priceLimit: string | BN) {
    const amountString = BN.isBN(amount) ? amount.toString() : amount
    const priceLimitString = BN.isBN(priceLimit)
      ? priceLimit.toString()
      : priceLimit
    const { to: tokenAddress, data } = await this.postRequest('/sell', {
      value: amountString,
      price_limit: priceLimitString,
    })
    return this.sendTransaction(tokenAddress, data)
  }

  // Admin Scenario
  async addNewReward(keys: Address[], values: number[]): Promise<number> {
    // create merkle
    const { root_hash: rootHash } = await this.postRequestMerkle('', {
      keys,
      values,
    })

    const { to: tokenAddress, data } = await this.postRequest('/add-reward', {
      root_hash: rootHash,
      total_portion: _.sum(values),
    })

    const result = await this.sendTransaction(tokenAddress, data)
    if (result.logs === undefined) throw new Error('Cannot report reward.')
    return parseInt(result.logs[0].topics[1])
  }

  async getRewardDetail(
    rewardID: number,
  ): Promise<{ rootHash: string; totalReward: number; claimed: number }> {
    const {
      root_hash: rootHash,
      total_reward: totalReward,
      claimed,
    } = await this.getRequest(`/reward/${rewardID}`)

    return { rootHash, totalReward, claimed }
  }

  // User Scenario
  async getReward(rewardID: number): Promise<number> {
    const { rootHash } = await this.getRewardDetail(rewardID)
    const result = await this.getRequestMerkle(`/${rootHash}`, {
      key: await this.getAccount(),
    })
    if (result[0].value === undefined) return 0
    return result[0].value
  }

  async sendClaimReward(rewardID: number) {
    const { rootHash } = await this.getRewardDetail(rewardID)
    const account = await this.getAccount()
    const proof = await this.getRequestMerkle(`/${rootHash}/proof/${account}`)
    const rewardPortion = await this.getReward(rewardID)
    const { to: tokenAddress, data } = await this.postRequest(
      `/reward/${rewardID}`,
      {
        beneficiary: account,
        reward_portion: rewardPortion,
        proof: proof,
      },
    )
    return this.sendTransaction(tokenAddress, data)
  }
}

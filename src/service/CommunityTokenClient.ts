import Web3 from 'web3'
import BaseClient from './BaseClient'
import BN from 'bn.js'
import * as config from '../config.json'
import { JsonResponse, OrderHistory, Address } from '../typing/index'
import axios from 'axios'

export default class CommunityTokenClient extends BaseClient {
  private coreAddress?: Address

  constructor(web3?: Web3, coreAddress?: Address) {
    super(web3)
    this.coreAddress = coreAddress
  }

  private async getRequest(path: string, params?: any): Promise<any> {
    const url = config.api + '/dapps/' + this.coreAddress + path
    const response = await axios.get<JsonResponse>(url, { params })
    if (response.data.message !== undefined) throw Error(response.data.message)
    return response.data.result
  }

  private async postRequest(path: string, data: any): Promise<any> {
    const url = config.api + '/dapps/' + this.coreAddress + path
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
}

import Web3 from 'web3'
import BaseClient from './BaseClient'
import BN from 'bn.js'
import * as config from '../config.json'
import { JsonResponse, Address } from '../typing/index'
import axios from 'axios'

export default class CommunityTokenClient extends BaseClient {
  private coreAddress?: Address

  constructor(web3?: Web3, coreAddress?: Address) {
    super(web3)
    this.coreAddress = coreAddress
  }

  private async getRequest(path: string): Promise<any> {
    const url = config.api + '/dapps/' + this.coreAddress + path
    const response = await axios.get<JsonResponse>(url)
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

  async transfer(to: Address, value: string | BN) {
    const valueString = BN.isBN(value) ? value.toString() : value
    const { to: tokenAddress, data } = await this.postRequest('/transfer', {
      to: to,
      value: valueString,
    })

    return this.sendTransaction(tokenAddress, data)
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
}

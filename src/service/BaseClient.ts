import axios from 'axios'
import Web3 from 'web3'
import { Address, JsonResponse } from '../typing'

/**
 * This is a BaseClient Class
 */
export default class BaseClient {
  protected static API = 'https://api.bandprotocol.com'
  protected web3?: Web3

  protected constructor(web3?: Web3) {
    this.web3 = web3
  }

  protected throw(m: string): never {
    throw new Error(m)
  }

  protected async getAccount(): Promise<Address> {
    if (this.web3 === undefined) return this.throw('Required provider.')
    return (await this.web3.eth.getAccounts())[0]
  }

  protected async sendTransaction(to: Address, data: string) {
    if (this.web3 === undefined) return this.throw('Required provider.')
    return await this.web3.eth.sendTransaction({
      from: await this.getAccount(),
      to,
      data,
      gas: await this.web3.eth.estimateGas({
        to,
        data,
      }),
    })
  }

  protected async getRequest(path: string, params?: any): Promise<any> {
    const url = BaseClient.API + path
    const response = await axios.get<JsonResponse>(url, { params })
    if (response.data.message !== undefined) {
      return this.throw(response.data.message)
    }
    return response.data.result
  }

  protected async postRequest(path: string, data: any): Promise<any> {
    const url = BaseClient.API + path
    const response = await axios.post<JsonResponse>(url, data)
    if (response.data.message !== undefined) {
      return this.throw(response.data.message)
    }
    return response.data.result
  }
}

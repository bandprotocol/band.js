import Web3 from 'web3'
import Utils from './Utils'
import { Address } from '../typing'
import Transaction from './Transaction'
// import { TransactionReceipt } from 'web3-core/types'

/**
 * This is a BaseClient Class
 */
export default class BaseClient {
  // protected static API = 'https://api.bandprotocol.com'
  protected web3?: Web3

  protected constructor(web3?: Web3) {
    this.web3 = web3
  }

  protected async getAccount(): Promise<Address> {
    if (this.web3 === undefined) return Utils.throw('Required provider.')
    return (await this.web3.eth.getAccounts())[0]
  }

  protected isLogin(): boolean {
    return this.web3 !== undefined
  }

  protected async createTransaction(
    to: Address,
    data: string,
    isFeelessable: boolean,
    nonce?: number,
  ) {
    if (this.web3 === undefined) return Utils.throw('Required provider.')
    const sender = await this.getAccount()
    return new Transaction(this.web3, sender, to, data, isFeelessable, nonce)

    // sendAndWait6Confirmations: () => {
    //   if (this.web3 === undefined) return Utils.throw('Required provider.')
    //   const promi = this.web3.eth.sendTransaction({
    //     from,
    //     to,
    //     data,
    //   })
    //   return new Promise<TransactionReceipt>((resolve, reject) => {
    //     promi
    //       .on('confirmation', (confNumber, receipt) => {
    //         if (confNumber === 6) {
    //           return resolve(receipt)
    //         }
    //       })
    //       .on('error', error => reject(error))
    //   })
    // },
    //   }
  }

  // protected async getRequest(path: string, params?: any): Promise<any> {
  //   const url = BaseClient.API + path
  //   const response = await axios.get<JsonResponse>(url, { params })
  //   if (response.data.message !== undefined) {
  //     return Utils.throw(response.data.message)
  //   }
  //   return response.data.result
  // }

  // protected async postRequest(path: string, data: any): Promise<any> {
  //   const url = BaseClient.API + path
  //   const response = await axios.post<JsonResponse>(url, data)
  //   if (response.data.message !== undefined) {
  //     return Utils.throw(response.data.message)
  //   }
  //   return response.data.result
  // }
}

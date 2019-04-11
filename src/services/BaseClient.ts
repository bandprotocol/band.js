import Web3 from 'web3'
import InternalUtils from './InternalUtils'
// import BN from 'bn.js'
import { Address } from '../typing'
import Transaction from './Transaction'
// import { TransactionReceipt } from 'web3-core/types'

/**
 * This is a BaseClient Class
 */
export default class BaseClient {
  protected web3?: Web3

  protected constructor(web3?: Web3) {
    this.web3 = web3
  }

  protected async getAccount(): Promise<Address> {
    if (this.web3 === undefined)
      return InternalUtils.throw('Required provider.')
    const account = (await this.web3.eth.getAccounts())[0]
    if (!account) return InternalUtils.throw('Cannot get account.')
    return account
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
    if (this.web3 === undefined)
      return InternalUtils.throw('Required provider.')
    const sender = await this.getAccount()
    return new Transaction(this.web3, sender, to, data, isFeelessable, nonce)
  }
}

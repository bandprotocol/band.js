import Web3 from 'web3'
import { Address } from '../typing'

export default class BaseClient {
  protected web3?: Web3

  protected constructor(web3?: Web3) {
    this.web3 = web3
  }

  protected async getAccount(): Promise<Address> {
    if (this.web3 === undefined) throw new Error('Required provider.')
    return (await this.web3.eth.getAccounts())[0]
  }

  protected async sendTransaction(to: Address, data: string) {
    if (this.web3 === undefined) throw new Error('Required provider.')
    return await this.web3.eth.sendTransaction({
      from: await this.getAccount(),
      to,
      data,
      gas: '300000', // TODO: Fix gas cost hardcode
    })
  }
}

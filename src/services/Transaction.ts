import Web3 from 'web3'
import { Address } from '../typing/index'

export default class Transaction {
  private web3: Web3
  private sender: Address
  private to: Address
  private data: string

  constructor(web3: Web3, sender: Address, to: Address, data: string) {
    this.web3 = web3
    this.sender = sender
    this.to = to
    this.data = data
  }

  getTxDetail() {
    return {
      sender: this.sender,
      to: this.to,
      data: this.data,
    }
  }

  async send() {
    return new Promise((resolve, reject) => {
      this.web3.eth
        .sendTransaction({
          from: this.sender,
          to: this.to,
          data: this.data,
        })
        .once('transactionHash', txHash => resolve(txHash))
        .once('error', error => reject(error))
    })
  }
}

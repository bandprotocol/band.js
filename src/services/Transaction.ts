import Web3 from 'web3'
// import InternalUtils from './InternalUtils'
import { Address } from '../typing/index'

export default class Transaction {
  private web3: Web3
  private sender: Address
  private to: Address
  private data: string
  // private isFeelessable: boolean
  // private lastTimestamp?: number

  constructor(
    web3: Web3,
    sender: Address,
    to: Address,
    data: string,
    // isFeelessable: boolean,
    // lastTimestamp?: number,
  ) {
    this.web3 = web3
    this.sender = sender
    this.to = to
    this.data = data
    // this.isFeelessable = isFeelessable
    // this.lastTimestamp = lastTimestamp
  }

  getTxDetail() {
    return {
      sender: this.sender,
      to: this.to,
      data: this.data,
    }
  }

  send() {
    return this.web3.eth.sendTransaction({
      from: this.sender,
      to: this.to,
      data: this.data,
    })
  }

  async sendFeeless() {
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

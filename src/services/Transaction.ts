import Web3 from 'web3'
import InternalUtils from './InternalUtils'
import { Address } from '../typing/index'

export default class Transaction {
  private web3: Web3
  private sender: Address
  private to: Address
  private data: string
  private isFeelessable: boolean
  private lastTimestamp?: number

  constructor(
    web3: Web3,
    sender: Address,
    to: Address,
    data: string,
    isFeelessable: boolean,
    lastTimestamp?: number,
  ) {
    this.web3 = web3
    this.sender = sender
    this.to = to
    this.data = data
    this.isFeelessable = isFeelessable
    this.lastTimestamp = lastTimestamp
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
    // 0x(2hex) + funcSig(8hex) + userAddress(64hex) + otherParams = data
    if (!this.isFeelessable)
      return InternalUtils.throw(
        'This function cannot use feeless transaction.',
      )
    if (this.lastTimestamp === undefined) return InternalUtils.throw('Required last timestamp')
    const newTimestamp = (new Date()).getTime() === this.lastTimestamp ? this.lastTimestamp + 1 : (new Date()).getTime()
    const funcInterface = '0x' + this.data.slice(2, 10)
    const dataNoSig = '0x' + this.data.slice(10 + 64)
    const senderSig = await InternalUtils.signMessage(
      this.web3,
      this.web3.utils.soliditySha3(newTimestamp, dataNoSig),
      this.sender,
    )

    return InternalUtils.postRequest('/band/feeless', {
      sender: this.sender,
      to: this.to,
      newTimestamp: newTimestamp,
      funcInterface: funcInterface,
      data: dataNoSig,
      senderSig: senderSig,
    })
  }
}

import Web3 from 'web3'
import InternalUtils from './InternalUtils'
import { Address } from '../typing/index'

export default class Transaction {
  private web3: Web3
  private sender: Address
  private to: Address
  private data: string
  private isFeelessable: boolean
  private nonce?: number

  constructor(
    web3: Web3,
    sender: Address,
    to: Address,
    data: string,
    isFeelessable: boolean,
    nonce?: number,
  ) {
    this.web3 = web3
    this.sender = sender
    this.to = to
    this.data = data
    this.isFeelessable = isFeelessable
    this.nonce = nonce
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
    if (this.nonce === undefined) return InternalUtils.throw('Required nonce')

    const funcInterface = '0x' + this.data.slice(2, 10)
    const dataNoSig = '0x' + this.data.slice(10 + 64)
    const senderSig = await InternalUtils.signMessage(
      this.web3,
      this.web3.utils.soliditySha3(this.nonce, dataNoSig),
      this.sender,
    )

    return InternalUtils.postRequest('/band/feeless', {
      sender: this.sender,
      to: this.to,
      funcInterface: funcInterface,
      data: dataNoSig,
      senderSig: senderSig,
    })
  }
}

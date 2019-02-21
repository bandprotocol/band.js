import Web3 from 'web3'
import Utils from './Utils'
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

  send() {
    return this.web3.eth.sendTransaction({
      from: this.sender,
      to: this.to,
      data: this.data,
    })
  }

  // TODO: metamask bug
  async signByUser(dataNoSig: string) {
    if (typeof window !== 'undefined') {
      const metaMaskWeb3 = (window as any).web3
      return new Promise((resolve, reject) => {
        if (this.nonce === undefined) return Utils.throw('Required nonce.')
        metaMaskWeb3.personal.sign(
          this.web3.utils.soliditySha3(this.nonce, dataNoSig),
          this.sender,
          function(err: any, signed: any) {
            if (err !== null) reject(err)
            resolve(signed)
          },
        )
      })
    } else {
      if (this.nonce === undefined) return Utils.throw('Required nonce.')
      return await this.web3.eth.sign(
        this.web3.utils.soliditySha3(this.nonce, dataNoSig),
        this.sender,
      )
    }
  }

  async sendFeeless() {
    // 0x(2hex) + funcSig(8hex) + userAddress(64hex) + otherParams = data
    if (!this.isFeelessable)
      return Utils.throw('This function cannot use feeless transaction.')
    const funcInterface = '0x' + this.data.slice(2, 10)
    const dataNoSig = '0x' + this.data.slice(10 + 64)
    const senderSig = await this.signByUser(dataNoSig)

    return Utils.postRequest('/band/feeless', {
      sender: this.sender,
      to: this.to,
      funcInterface: funcInterface,
      data: dataNoSig,
      senderSig: senderSig,
    })
  }
}

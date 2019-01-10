import Web3 from 'web3'
// import BN from 'bn.js'
import { Provider } from 'web3/providers'
import axios from 'axios'
import * as config from '../config.json'

interface BandProtocolClientConstructorArgs {
  provider?: Provider
}

interface GetBalance {
  result: {
    balance: string
  }
}

export default class BandProtocolClient {
  // field
  provider?: Provider

  constructor(provider?: Provider) {
    this.provider = provider
  }

  make(args: BandProtocolClientConstructorArgs) {
    return new BandProtocolClient(args.provider)
  }

  async getNetwork(): Promise<string> {
    const web3 = new Web3(this.provider)
    const networkId = await web3.eth.net.getId()
    switch (networkId) {
      case 1:
        return 'Mainnet'
      case 3:
        return 'Ropsten'
      case 4:
        return 'Rinkeby'
      case 42:
        return 'Kovan'
      default:
        return 'Unknown'
    }
  }

  async getBalance(): Promise<string> {
    return await axios
      .get<GetBalance>(
        config.api + '/balance/0x9fbE9e0869c32C4622fCa27879A6d8bC2fD79A5D',
      )
      .then(res => {
        return res.data.result.balance
      })
  }
}

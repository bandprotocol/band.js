import Web3 from 'web3'
// import BN from 'bn.js'
import { Provider } from 'web3/providers'
import axios from 'axios'
import * as config from '../config.json'
import CommunityTokenClient from './communityTokenClient'

interface BandProtocolClientConstructorArgs {
  provider?: Provider
}

interface BandProtocolClientAtArgs {
  coreAddress: string
}

interface JsonResponse {
  result?: any
  message?: string
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

  async at(args: BandProtocolClientAtArgs) {
    const foundAddress = await axios.get(config.api + '/dapps').then(res => {
      const filter_dapps = res.data.result.dapps.filter(
        (element: any) => element.address === args.coreAddress,
      )
      if (filter_dapps.length === 0) {
        throw new Error("This contract's address is not valid.")
      }
      return filter_dapps[0].address
    })
    return new CommunityTokenClient(this.provider, foundAddress)
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
    const response = await axios.get<JsonResponse>(
      config.api + '/band/balance/0x9fbE9e0869c32C4622fCa27879A6d8bC2fD79A5D',
    )
    return response.data.result.balance
  }
}

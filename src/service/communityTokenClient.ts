import { Provider } from 'web3/providers'
import axios from 'axios'
import * as config from '../config.json'

interface CommunityTokenClientTransferArgs {
  to: string
  value: string
}

interface JsonResponse {
  result?: any
  error?: string
}

export default class CommunityTokenClient {
  provider?: Provider
  coreAddress?: string

  constructor(provider?: Provider, coreAddress?: string) {
    this.provider = provider
    this.coreAddress = coreAddress
  }

  async getBalance(): Promise<string> {
    const response = await axios.get<JsonResponse>(
      config.api +
        '/' +
        this.coreAddress +
        '/balance/0x85109F11A7E1385ee826FbF5dA97bB97dba0D76f',
    )

    return response.data.result.balance
  }

  async transfer(args: CommunityTokenClientTransferArgs): Promise<any> {
    const response = await axios.post(
      config.api + '/dapps/' + this.coreAddress + '/transfer',
      {
        to: args.to,
        value: args.value,
      },
    )
    return response.data.result
  }
}

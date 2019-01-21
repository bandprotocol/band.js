import Web3 from 'web3'
import BN from 'bn.js'
import { Provider } from 'web3/providers'
import BaseClient from './BaseClient'
import axios from 'axios'
import config from '../config'
import CommunityTokenClient from './communityTokenClient'
import { JsonResponse, Address } from '../typing/index'

/**
 * This is class for get balance and transfer BandToken.
 */
export default class BandProtocolClient extends BaseClient {
  private constructor(web3?: Web3) {
    super(web3)
  }

  private async getRequest(path: string): Promise<any> {
    const url = config.api + '/band' + path
    const response = await axios.get<JsonResponse>(url)
    if (response.data.message !== undefined) throw Error(response.data.message)
    return response.data.result
  }

  private async postRequest(path: string, data: any): Promise<any> {
    const url = config.api + '/band' + path
    const response = await axios.post<JsonResponse>(url, data)
    if (response.data.message !== undefined) throw Error(response.data.message)
    return response.data.result
  }

  /**
   * This is function with creating
   *
   * @param args A provider's object.
   * @returns An instance of BandProtocolClient.
   */
  static async make(args: { provider?: Provider }) {
    if (args.provider !== undefined) {
      const web3: Web3 = new Web3(args.provider)
      return new BandProtocolClient(web3)
    } else {
      return new BandProtocolClient()
    }
  }

  /**
   *
   * @param coreAddress A CommunityCore's address.
   * @returns An instance of CommunityTokenClient.
   */
  async at(coreAddress: Address) {
    const response = await axios.get<JsonResponse>(`${config.api}/dapps`)
    const filterDapps = response.data.result.dapps.filter(
      (element: any) => element.address === coreAddress,
    )
    if (filterDapps.length === 0) {
      throw new Error("This dapp contract's address is invalid.")
    }
    if (response.data.message !== undefined) throw Error(response.data.message)
    return new CommunityTokenClient(this.web3, filterDapps[0].address)
  }

  /***
   * This is a function what the user's network currently use.
   *
   * @returns A network's type.(eg. Mainnet, Ropsten and so on)
   */
  async getNetworkType(): Promise<string> {
    if (this.web3 === undefined) throw new Error('Required provider.')
    const networkId = await this.web3.eth.net.getId()
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

  /**
   * This is function that returns user's BandToken balance.
   *
   * @returns A balance.
   */
  async getBalance(): Promise<BN> {
    const account = await this.getAccount()
    const result = await this.getRequest(`/balance/${account}`)
    return new BN(result.balance)
  }

  /**
   * This is function that transfers BandToken.
   *
   * @param to A receiver.
   * @param value An amounts.
   */
  async transfer(to: Address, value: string | BN) {
    const valueString = BN.isBN(value) ? value.toString() : value
    const { to: bandAddress, data } = await this.postRequest('/transfer', {
      to: to,
      value: valueString,
    })

    return this.sendTransaction(bandAddress, data)
  }
}

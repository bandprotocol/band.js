import BN from 'bn.js'
import Web3 from 'web3'
// import { Provider } from 'web3/providers'  TODO: bring back provider type
import BaseClient from './BaseClient'
import CommunityClient from './CommunityClient'
import { Address, Equation, BandInfo, DappInfo } from '../typing/index'

/**
 * This is class for get balance and transfer BandToken.
 */
export default class BandProtocolClient extends BaseClient {
  private constructor(web3?: Web3) {
    super(web3)
  }

  /**
   * This is function with creating
   *
   * @param args A provider's object.
   * @returns An instance of BandProtocolClient.
   */
  static async make(args: { provider: any }) {
    if (args.provider !== undefined) {
      const web3: Web3 = new Web3(args.provider)
      return new BandProtocolClient(web3)
    } else {
      return new BandProtocolClient()
    }
  }

  async getBand(): Promise<BandInfo> {
    const { band } = await this.getRequest('/dapps')
    return {
      ...band,
      price: parseFloat(band.price),
      last24Hrs: parseFloat(band.last24Hrs),
    }
  }

  async getDApps(): Promise<DappInfo[]> {
    const { dapps } = await this.getRequest('/dapps')
    return dapps.map((e: any) => ({
      ...e,
      marketCap: parseFloat(e.marketCap),
      price: parseFloat(e.price),
      last24Hrs: parseFloat(e.last24Hrs),
    }))
  }

  async enableEthereum() {
    if (this.web3 === undefined) {
      return this.throw('Required provider.')
    }
    // TODO: make it offcial
    const enable = (this.web3.currentProvider as any).enable
    if (enable) {
      enable()
    }
  }

  async createDeployTransaction(
    name: string,
    symbol: string,
    logo: string,
    description: string,
    website: string,
    voting: Address,
    keys: string[],
    values: (string | number)[],
    equation: Equation,
  ) {
    const { to, data } = await this.postRequestBand('/create-dapp', {
      name,
      symbol,
      decimal: 18,
      voting,
      keys,
      values,
      equation,
    })

    const { logs } = await (await this.createTransaction(to, data)).send()
    const chunk = logs
      ? logs[logs.length - 1].data
      : this.throw("Transaction's logs is invalid.")
    const coreAddress = '0x' + chunk.slice(218, 258)
    const communityClient = await this.at(coreAddress)
    await communityClient.reportDetail({
      name,
      symbol,
      logo,
      description,
      website,
    })
    return communityClient
  }

  /**
   *
   * @param coreAddress A CommunityCore's address.
   * @returns An instance of CommunityClient.
   */
  async at(coreAddress: Address) {
    const { dapps } = await this.getRequest('/dapps')
    const filterDapps = dapps.filter(
      (element: any) =>
        element.address.toLowerCase() === coreAddress.toLowerCase(),
    )
    if (filterDapps.length === 0) {
      return this.throw("This dapp contract's address is invalid.")
    }
    return new CommunityClient(this.web3, filterDapps[0].address)
  }

  /***
   * This is a function what the user's network currently use.
   *
   * @returns A network's type.(eg. Mainnet, Ropsten and so on)
   */
  async getNetworkType(): Promise<string> {
    if (this.web3 === undefined) {
      return this.throw('Required provider.')
    }
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
    const result = await this.getRequestBand(`/balance/${account}`)
    return new BN(result.balance)
  }

  /**
   * This is function that transfers BandToken.
   *
   * @param to A receiver.
   * @param value An amounts.
   */
  async createTransferTransaction(to: Address, value: string | BN) {
    const valueString = BN.isBN(value) ? value.toString() : value
    const { to: bandAddress, data } = await this.postRequestBand('/transfer', {
      to: to,
      value: valueString,
    })

    return this.createTransaction(bandAddress, data)
  }

  private async getRequestBand(path: string): Promise<any> {
    return await this.getRequest(`/band${path}`)
  }

  private async postRequestBand(path: string, data: any): Promise<any> {
    return await this.postRequest(`/band${path}`, data)
  }
}

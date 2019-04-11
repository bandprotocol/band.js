import BN from 'bn.js'
import Web3 from 'web3'
// import { Provider } from 'web3/providers'  TODO: bring back provider type
import BaseClient from './BaseClient'
import CommunityClient from './CommunityClient'
import InternalUtils from './InternalUtils'
import IPFS from './IPFS'
import { Address } from '../typing/index'

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

  // TODO: recheck again
  async enableEthereum() {
    if (this.web3 === undefined) {
      return InternalUtils.throw('Required provider.')
    }
    const enable = (this.web3.eth as any).requestAccounts
    if (enable) {
      enable()
    }
  }

  async deployCommunity(
    name: string,
    symbol: string,
    logo: string,
    banner: string,
    description: string,
    website: string,
    organization: string,
    voting: Address,
    keys: string[],
    values: (string | number)[],
    collateralEquation: (string | BN)[],
  ) {
    const { to, data } = await this.postRequestBand('/create-dapp', {
      name,
      symbol,
      decimal: 18,
      voting,
      keys: keys.concat([
        'info:logo',
        'info:banner',
        'info:description',
        'info:website',
        'info:organization',
      ]),
      values: values.concat([
        logo,
        banner,
        await IPFS.set(description),
        await IPFS.set(website),
        await IPFS.set(organization),
      ]),
      collateralEquation,
    })
    const tx = await this.createTransaction(to, data, false)
    await tx.send()
  }

  /**
   *
   * @param coreAddress A CommunityCore's address.
   * @returns An instance of CommunityClient.
   */
  async at(coreAddress: Address) {
    const { communityByAddress } = await InternalUtils.graphqlRequest(
      `{
        communityByAddress(address:"${coreAddress}") {
          address
      }
    }`,
    )
    if (communityByAddress && communityByAddress.address === coreAddress) {
      return new CommunityClient(coreAddress, this.web3)
    }
    return InternalUtils.throw("This dapp contract's address is invalid.")
  }

  /***
   * This is a function what the user's network currently use.
   *
   * @returns A network's type.(eg. Mainnet, Ropsten and so on)
   */
  async getNetworkType(): Promise<string> {
    if (this.web3 === undefined) {
      return InternalUtils.throw('Required provider.')
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
   * This is function that transfers BandToken.
   *
   * @param to A receiver.
   * @param value An amounts.
   */
  async createTransferTransaction(to: Address, value: string | BN) {
    const valueString = BN.isBN(value) ? value.toString() : value
    const { to: bandAddress, data, nonce } = await this.postRequestBand(
      '/transfer',
      {
        sender: await this.getAccount(),
        to: to,
        value: valueString,
      },
    )
    return this.createTransaction(bandAddress, data, true, nonce)
  }

  private async postRequestBand(path: string, data: any): Promise<any> {
    return await InternalUtils.postRequest(`/band${path}`, data)
  }

  static setAPI(newAPI: string) {
    InternalUtils.API = newAPI
  }

  static setGraphQlAPI(newGraphQlAPI: string) {
    InternalUtils.GRAPH_QL_API = newGraphQlAPI
  }
}

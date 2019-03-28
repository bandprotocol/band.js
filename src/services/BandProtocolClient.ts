import BN from 'bn.js'
import Web3 from 'web3'
// import { Provider } from 'web3/providers'  TODO: bring back provider type
import BaseClient from './BaseClient'
import CommunityClient from './CommunityClient'
import InternalUtils from './InternalUtils'
import IPFS from './IPFS'
import { Address, BandInfo, DappInfo } from '../typing/index'

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

  async getBandInfo(): Promise<BandInfo> {
    const { band } = await InternalUtils.getRequest('/dapps')
    return {
      ...band,
      price: parseFloat(band.price),
      last24Hrs: parseFloat(band.last24Hrs),
    }
  }

  async getBandInfoQL(): Promise<BandInfo> {
    // TODO : add price and last24Hrs
    const { band } = await InternalUtils.graphqlRequest(
      `{
      band {
        address
      }
    }`,
    )
    return { ...band, price: 1.03, last24Hrs: 6.28 }
  }

  async getDAppsInfo(): Promise<any> {
    const { dapps } = await InternalUtils.getRequest('/dapps')
    return Promise.all(
      dapps.map(async (e: any) => {
        const { community } = await InternalUtils.graphqlRequest(
          `{
          community(address:"${e.address}") {
            config {
              subConfigs {
                prefix
                keyValues {
                  key
                  value
                }
              }
            }
          }
        }`,
        )
        const { subConfigs } = community.config
        const infos = subConfigs.filter(
          (subConfig: any) => subConfig.prefix === 'info',
        )
        const infoObj: any = {}
        if (infos.length > 0) {
          const kvs = infos[0].keyValues
          for (const kv of kvs) {
            const name = kv.key.slice(5)
            if (name === 'logo' || name === 'banner') {
              infoObj[name] = IPFS.toIPFSHash(
                '0x' + new BN(kv.value).toString(16),
              )
            } else {
              infoObj[name] = await IPFS.get(
                '0x' + new BN(kv.value).toString(16),
              )
            }
          }
        }

        return {
          ...e,
          ...infoObj,
          marketCap: parseFloat(e.marketCap),
          price: parseFloat(e.price),
          last24Hrs: parseFloat(e.last24Hrs),
        }
      }),
    )
  }

  async getDAppsInfoQL(): Promise<DappInfo[]> {
    const { allCommunities } = await InternalUtils.graphqlRequest(
      `{
        allCommunities {
          address
          token {
            name
          }
        }
      }`,
    )
    return allCommunities.map((comm: any) => {
      return { ...comm.token, address: comm.address }
    })
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
    const { dapps } = await InternalUtils.getRequest('/dapps')
    const filterDapps = dapps.filter(
      (element: any) =>
        element.address.toLowerCase() === coreAddress.toLowerCase(),
    )
    if (filterDapps.length === 0) {
      return InternalUtils.throw("This dapp contract's address is invalid.")
    }
    return new CommunityClient(filterDapps[0].address, this.web3)
  }

  async atQL(coreAddress: Address) {
    const { community } = await InternalUtils.graphqlRequest(
      `{
      community(address:"${coreAddress}") {
        address
      }
    }`,
    )
    if (community.address !== coreAddress) {
      return InternalUtils.throw("This dapp contract's address is invalid.")
    }
    return new CommunityClient(community.address, this.web3)
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
   * This is function that returns user's BandToken balance.
   *
   * @returns A balance.
   */
  async getBalance(): Promise<BN> {
    const account = await this.getAccount()
    const result = await this.getRequestBand(`/balance/${account}`)
    return new BN(result.balance)
  }

  async getBalanceQL(): Promise<BN> {
    const account = await this.getAccount()
    const { band } = await InternalUtils.graphqlRequest(
      `{
        band {
          balances(filteredBy:{
            users: ["${account}"]
          }) {
            value
          }
        }
      }`,
    )
    return new BN(band.balances[0].value)
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

  private async getRequestBand(path: string): Promise<any> {
    return await InternalUtils.getRequest(`/band${path}`)
  }

  private async postRequestBand(path: string, data: any): Promise<any> {
    return await InternalUtils.postRequest(`/band${path}`, data)
  }

  static setAPI(newAPI: string) {
    InternalUtils.API = newAPI
  }
}

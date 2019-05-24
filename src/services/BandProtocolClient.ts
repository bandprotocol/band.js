import BN from 'bn.js'
import Web3 from 'web3'
// import { Provider } from 'web3/providers'  TODO: bring back provider type
import BaseClient from './BaseClient'
import CommunityClient from './CommunityClient'
import InternalUtils from './InternalUtils'
import { Address, CommunityDetail, SendToken } from '../typing/index'
import delay from 'delay'

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

  async createCommunity({
    name,
    symbol,
    bonding: { collateralEquation, liquiditySpread },
    params: { expirationTime, minParticipationPct, supportRequiredPct },
  }: CommunityDetail) {
    const { to, data } = await this.postRequestBand('/create-dapp', {
      name,
      symbol,
      bondingCollateralEquation: collateralEquation,
      bondingLiquiditySpread: liquiditySpread,
      paramsExpirationTime: expirationTime,
      paramsMinParticipationPct: minParticipationPct,
      paramsSupportRequiredPct: supportRequiredPct,
    })
    const tx = await this.createTransaction(to, data)

    return new Promise<CommunityClient>((resolve, reject) => {
      tx.send().on('transactionHash', async (tx_hash: string) => {
        if (!this.web3) {
          reject()
          return
        }
        while (true) {
          const log = await this.web3.eth.getTransactionReceipt(tx_hash)
          if (log) {
            if (!log.status || !log.logs) {
              reject()
              return
            }
            const lastEvent = log.logs[log.logs.length - 1]
            resolve(
              new CommunityClient(
                this.web3.utils.toChecksumAddress(
                  '0x' + lastEvent.data.slice(26),
                ),
                this.web3,
              ),
            )
            return
          } else {
            await delay(1000)
          }
        }
      })
    })
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
  async createTransferTransaction({ to, value }: SendToken) {
    const valueString = BN.isBN(value) ? value.toString() : value
    const { to: bandAddress, data } = await this.postRequestBand('/transfer', {
      to: to,
      value: valueString,
    })
    return this.createTransaction(bandAddress, data)
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

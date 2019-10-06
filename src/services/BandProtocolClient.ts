// import BN from 'bn.js'
import Web3 from 'web3'
// import { Provider } from 'web3/providers'  TODO: bring back provider type
import BaseClient from './BaseClient'
import TokenClient from './TokenClient'
import TCDClient from './TCDClient'
import InternalUtils from './InternalUtils'
import Txgen from './Txgen'
import { Address, SendToken } from '../typing/index'
import ParameterClient from './ParameterClient'
import BN from 'bn.js'

/**
 * This is class for get balance and transfer BandToken.
 */
export default class BandProtocolClient extends BaseClient {
  private bandAddress: Address

  private constructor(bandAddress: Address, web3?: Web3) {
    super(web3)
    this.bandAddress = bandAddress
  }

  /**
   * This is function with creating
   *
   * @param args A provider's object.
   * @returns An instance of BandProtocolClient.
   */
  static make(args: { bandAddress: Address; provider: any }) {
    if (args.provider !== undefined) {
      const web3: Web3 = new Web3(args.provider)
      return new BandProtocolClient(args.bandAddress, web3)
    } else {
      return new BandProtocolClient(args.bandAddress)
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

  /**
   *
   * @param args DatasetToken and BondingCurve address.
   * @returns An instance of TokenClient.
   */
  newTokenClient(args: { tokenAddress: Address; curveAddress: Address }) {
    return new TokenClient({
      bandAddress: this.bandAddress,
      tokenAddress: args.tokenAddress,
      curveAddress: args.curveAddress,
      web3: this.web3,
    })
  }

  /**
   *
   * @param parameterAddress Parameter address.
   * @returns An instance of ParameterClient.
   */
  newParameterClient(parameterAddress: Address) {
    return new ParameterClient(parameterAddress, this.web3)
  }

  /**
   *
   * @param tcdAddress Parameter address.
   * @returns An instance of TcdClient.
   */
  newTcdClient(tcdAddress: Address) {
    return new TCDClient(tcdAddress, this.web3)
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
    if (!this.web3) {
      return InternalUtils.throw('Required provider.')
    }
    const valueString = BN.isBN(value) ? value.toString() : value
    return this.createTransaction(
      this.bandAddress,
      Txgen.createTransactionData(
        'transfer(address,uint256)',
        ['address', 'uint256'],
        [to, valueString],
      ),
    )
  }

  static setAPI(newAPI: string) {
    InternalUtils.API = newAPI
  }

  static setGraphQlAPI(newGraphQlAPI: string) {
    InternalUtils.GRAPH_QL_API = newGraphQlAPI
  }
}

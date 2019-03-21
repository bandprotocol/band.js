import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import InternalUtils from './InternalUtils'

export default class Utils {
  static fromBlockchainUnit(value: BN): number {
    return new BigNumber(value.toString()).div(new BigNumber(1e18)).toNumber()
  }

  static toBlockchainUnit(value: number | string): BN {
    return new BN(
      new BigNumber(value).multipliedBy(new BigNumber(1e18)).toFixed(0),
    )
  }

  static async graphqlRequest(query: any): Promise<any> {
    return InternalUtils.graphqlRequest(query)
  }
}

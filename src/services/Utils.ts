import BigNumber from 'bignumber.js'
import BN from 'bn.js'

export default class Utills {
  static fromBlockchainUnit(value: BN): number {
    return new BigNumber(value.toString()).div(new BigNumber(1e18)).toNumber()
  }

  static toBlockchainUnit(value: number | string): BN {
    return new BN(
      new BigNumber(value).multipliedBy(new BigNumber(1e18)).toFixed(0),
    )
  }
}

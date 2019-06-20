import BigNumber from 'bignumber.js'
import axios from 'axios'
import BN from 'bn.js'
import InternalUtils from './InternalUtils'
import { JsonResponse } from '../typing/index'

export default class Utils {
  static opad64(x: string): string {
    return x.length < 64 ? this.pado64('0' + x) : x
  }

  static pado64(x: string): string {
    return x.length < 64 ? this.pado64(x + '0') : x
  }

  static fromBlockchainUnit(value: BN): number {
    return new BigNumber(value.toString()).div(new BigNumber(1e18)).toNumber()
  }

  static toBlockchainUnit(value: number | string): BN {
    return new BN(
      new BigNumber(value).multipliedBy(new BigNumber(1e18)).toFixed(0),
    )
  }

  static async getDataRequest(path: string, params?: any): Promise<any> {
    const url = InternalUtils.API + '/data' + path
    const response = await axios.get<JsonResponse>(url, { params })
    if (response.data.message !== undefined) {
      throw new Error(response.data.message)
    }
    return response.data.result
  }

  static async graphqlRequest(query: any): Promise<any> {
    return InternalUtils.graphqlRequest(query)
  }
}

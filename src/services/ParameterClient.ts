import BaseClient from './BaseClient'
import Web3 from 'web3'
import InternalUtils from './InternalUtils'
import BN from 'bn.js'

import { Address } from '../typing'

export default class ParameterClient extends BaseClient {
  private coreAddress: Address

  constructor(coreAddress: Address, web3?: Web3) {
    super(web3)
    this.coreAddress = coreAddress
  }

  async createProposalTransaction(
    reasonHash: string,
    keys: string[],
    values: (string | BN)[],
  ) {
    const { to: tokenAddress, data } = await this.postRequestParameter(
      '/propose',
      {
        reasonHash,
        keys,
        values: values.map((e: string | BN) => (BN.isBN(e) ? e.toString() : e)),
      },
    )
    return this.createTransaction(tokenAddress, data)
  }

  async createCastVoteTransaction(proposalId: number, isAccepted: boolean) {
    const { to, data } = await this.postRequestParameter(
      `/${proposalId}/vote`,
      {
        accepted: isAccepted,
      },
    )
    return this.createTransaction(to, data)
  }

  private async postRequestParameter(path: string, data: any): Promise<any> {
    return await InternalUtils.postRequest(
      `/parameter/${this.coreAddress}${path}`,
      data,
    )
  }
}

import BaseClient from './BaseClient'
import VoteClient from './VoteClient'
import Web3 from 'web3'
import InternalUtils from './InternalUtils'
import BN from 'bn.js'

import { Address } from '../typing'

export default class ParameterClient extends BaseClient {
  private coreAddress: Address
  private voteClient: VoteClient

  constructor(coreAddress: Address, web3?: Web3) {
    super(web3)
    this.coreAddress = coreAddress
    this.voteClient = new VoteClient(coreAddress, web3)
  }

  async getVotingPower(proposalId: number) {
    return await this.voteClient.getVotingPower(proposalId)
  }

  async createProposalTransaction(
    reasonHash: string,
    keys: string[],
    values: (string | BN)[],
  ) {
    const {
      to: tokenAddress,
      data,
      lastTimestamp,
    } = await this.postRequestParameter('/propose', {
      sender: await this.getAccount(),
      reasonHash,
      keys,
      values: values.map((e: string | BN) => (BN.isBN(e) ? e.toString() : e)),
    })
    return this.createTransaction(tokenAddress, data, true, lastTimestamp)
  }

  async createCastVoteTransaction(
    proposalId: number,
    yesVote: string | BN,
    noVote: string | BN,
  ) {
    return this.voteClient.createCastVoteTransaction(
      proposalId,
      yesVote,
      noVote,
    )
  }

  private async postRequestParameter(path: string, data: any): Promise<any> {
    return await InternalUtils.postRequest(
      `/parameter/${this.coreAddress}${path}`,
      data,
    )
  }
}

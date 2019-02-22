import BaseClient from './BaseClient'
import VoteClient from './VoteClient'
import Web3 from 'web3'
import Utils from './Utils'
import BN from 'bn.js'

import { Address, Parameter, Proposal, VoteResult } from '../typing'

export default class ParameterClient extends BaseClient {
  private coreAddress: Address
  private voteClient: VoteClient

  constructor(coreAddress: Address, web3?: Web3) {
    super(web3)
    this.coreAddress = coreAddress
    this.voteClient = new VoteClient(coreAddress, web3)
  }

  async getParameters(): Promise<Parameter[]> {
    const result = await this.getRequestParameter()
    return result.map((e: { key: string; value: string }) => ({
      ...e,
      value: new BN(e.value),
    }))
  }

  async getProposals(): Promise<Proposal[]> {
    const result = await this.getRequestParameter('/proposals')
    return result.map((e: any) => ({
      ...e,
      changes: e.changes.map((i: { key: string; value: string }) => ({
        ...i,
        value: new BN(i.value),
      })),
      yesVote: new BN(e.yesVote),
      noVote: new BN(e.noVote),
    }))
  }

  //TODO: recheck it
  async getVoteResultProposals(): Promise<VoteResult[]> {
    const account = await this.getAccount()
    const result = await this.getRequestParameter(`/proposals/vote/${account}`)
    return result.map((e: any) => ({
      ...e,
      yesVote: new BN(e.yesVote),
      noVote: new BN(e.noVote),
    }))
  }

  async createProposalTransaction(keys: string[], values: (string | BN)[]) {
    const { to: tokenAddress, data, nonce } = await this.postRequestParameter(
      '/proposals',
      {
        sender: await this.getAccount(),
        keys,
        values: values.map((e: string | BN) => (BN.isBN(e) ? e.toString() : e)),
      },
    )
    return this.createTransaction(tokenAddress, data, true, nonce)
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

  private async getRequestParameter(path?: string, params?: any): Promise<any> {
    const sendPath = path === undefined ? '' : path
    return await Utils.getRequest(
      `/parameter/${this.coreAddress}${sendPath}`,
      params,
    )
  }
  private async postRequestParameter(path: string, data: any): Promise<any> {
    return await Utils.postRequest(
      `/parameter/${this.coreAddress}${path}`,
      data,
    )
  }
}

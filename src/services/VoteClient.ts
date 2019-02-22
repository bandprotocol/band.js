import Web3 from 'web3'
import BN from 'bn.js'
import Utils from './Utils'
import BaseClient from './BaseClient'
import { Address } from '../typing'

export default class VoteClient extends BaseClient {
  private sendAddress: Address // coreAddres or tcrAddress

  constructor(sendAddress: Address, web3?: Web3) {
    super(web3)
    this.sendAddress = sendAddress
  }

  // can't use in feeless
  async createCastVoteTransaction(
    onChainId: number,
    yesVote: string | BN,
    noVote: string | BN,
  ) {
    const { to, data, nonce } = await this.postRequestVote(
      `/${onChainId}/castvote`,
      {
        sender: await this.getAccount(),
        yesVote: BN.isBN(yesVote) ? yesVote.toString() : yesVote,
        noVote: BN.isBN(noVote) ? noVote.toString() : noVote,
      },
    )
    return this.createTransaction(to, data, true, nonce)
  }

  async createCommitVoteTransaction(
    onChainId: number,
    yesVote: string | BN,
    noVote: string | BN,
    salt: string,
  ) {
    if (this.web3 === undefined) {
      return Utils.throw('Required provider.')
    }
    const commitHash = this.web3.utils.soliditySha3(yesVote, noVote, salt)
    const yesVoteBN = BN.isBN(yesVote) ? yesVote : new BN(yesVote)
    const noVoteBN = BN.isBN(noVote) ? noVote : new BN(noVote)
    const totalWeightBN = yesVoteBN.add(noVoteBN)
    const { to, data, nonce } = await this.postRequestVote(
      `/${onChainId}/commitvote`,
      {
        sender: await this.getAccount(),
        commitHash: commitHash,
        totalWeight: totalWeightBN.toString(),
      },
    )
    return this.createTransaction(to, data, true, nonce)
  }

  async createRevealVoteTransaction(
    onChainId: number,
    yesVote: string | BN,
    noVote: string | BN,
    salt: string,
  ) {
    const { to, data, nonce } = await this.postRequestVote(
      `/${onChainId}/revealvote`,
      {
        sender: await this.getAccount(),
        yesVote: BN.isBN(yesVote) ? yesVote.toString() : yesVote,
        noVote: BN.isBN(noVote) ? noVote.toString() : noVote,
        salt,
      },
    )
    return this.createTransaction(to, data, true, nonce)
  }

  private async postRequestVote(path: string, data: any): Promise<any> {
    return await Utils.postRequest(`/voting/${this.sendAddress}${path}`, data)
  }
}

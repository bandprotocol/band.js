import Web3 from 'web3'
import BN from 'bn.js'
import InternalUtils from './InternalUtils'
import BaseClient from './BaseClient'
import { Address, Vote } from '../typing'

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
    commitHash: string,
    totalWeight: string | BN,
  ) {
    if (this.web3 === undefined) {
      return InternalUtils.throw('Required provider.')
    }
    const { to, data, nonce } = await this.postRequestVote(
      `/${onChainId}/commitvote`,
      {
        sender: await this.getAccount(),
        commitHash: commitHash,
        totalWeight: BN.isBN(totalWeight)
          ? totalWeight.toString()
          : totalWeight,
      },
    )
    return this.createTransaction(to, data, true, nonce)
  }

  async createRevealVoteTransaction(
    onChainId: number,
    yesVote: string | BN,
    noVote: string | BN,
    salt: string | BN,
  ) {
    const { to, data } = await this.postRequestVote(
      `/${onChainId}/revealvote`,
      {
        sender: await this.getAccount(),
        yesVote: BN.isBN(yesVote) ? yesVote.toString() : yesVote,
        noVote: BN.isBN(noVote) ? noVote.toString() : noVote,
        salt: BN.isBN(salt) ? salt.toString() : salt,
      },
    )
    return this.createTransaction(to, data, false)
  }

  async getVotes(voter?: Address, pollIds?: number[]): Promise<Vote[]> {
    const result = await this.getRequestVote('/votes', {
      voter,
      pollId: pollIds,
    })

    return result.map((e: any) => ({
      ...e,
      yesWeight: e.yesWeight && new BN(e.yesWeight),
      noWeight: e.noWeight && new BN(e.noWeight),
    }))
  }

  async getVotesQL(voter?: Address, pollIds?: number[]): Promise<Vote[]> {
    // TODO : add filter
    console.log(voter, pollIds)
    const { tcr } = await InternalUtils.graphqlRequest(
      `
      {
        tcr(address:"${this.sendAddress}") {
          challenges {
            onChainId
            poll {
              votes {
                voter {
                  address
                }
                totalWeight
                yesWeight
                noWeight
              }
            }
          }
        }
      }
    `,
    )
    let { challenges } = tcr
    return challenges.reduce(
      (acc: any, challenge: any) =>
        acc.concat(
          challenge.poll.votes.map((vote: any) => ({
            onChainId: challenge.onChainId,
            voter: vote.voter.address,
            totalWeight: vote.totalWeight,
            yesWeight: vote.yesWeight,
            noWeight: vote.noWeight,
          })),
        ),
      [],
    )
  }

  async getVotingPower(pollId: number): Promise<BN> {
    const result = await this.getRequestVote(
      `/${pollId}/voting-power/${await this.getAccount()}`,
      {},
    )

    return new BN(result.votingPower)
  }

  private async getRequestVote(path: string, params: any): Promise<any> {
    return await InternalUtils.getRequest(
      `/voting/${this.sendAddress}${path}`,
      params,
    )
  }

  private async postRequestVote(path: string, data: any): Promise<any> {
    return await InternalUtils.postRequest(
      `/voting/${this.sendAddress}${path}`,
      data,
    )
  }
}

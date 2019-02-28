import BaseClient from './BaseClient'
import VoteClient from './VoteClient'
import Web3 from 'web3'
import InternalUtils from './InternalUtils'
import BN from 'bn.js'
import { Address, Entry, Challenge } from '../typing'

export default class TCRClient extends BaseClient {
  private tcrAddress: Address
  private voteClient: VoteClient

  constructor(tcrAddress: Address, web3?: Web3) {
    super(web3)
    this.tcrAddress = tcrAddress
    this.voteClient = new VoteClient(tcrAddress, web3)
  }

  async createEntryTransaction(dataHash: string, amount: string | BN) {
    const { to, data, nonce } = await this.postRequestTCR('/entries', {
      sender: await this.getAccount(),
      dataHash: dataHash,
      deposit: BN.isBN(amount) ? amount.toString() : amount,
    })
    return this.createTransaction(to, data, true, nonce)
  }

  async createDepositTransaction(dataHash: string, amount: string | BN) {
    const { to, data, nonce } = await this.postRequestTCR('/deposit', {
      sender: await this.getAccount(),
      dataHash: dataHash,
      amount: BN.isBN(amount) ? amount.toString() : amount,
    })
    return this.createTransaction(to, data, true, nonce)
  }

  async createWithdrawTransaction(dataHash: string, amount: string | BN) {
    const { to, data, nonce } = await this.postRequestTCR('/withdraw', {
      sender: await this.getAccount(),
      dataHash: dataHash,
      amount: BN.isBN(amount) ? amount.toString() : amount,
    })
    return this.createTransaction(to, data, true, nonce)
  }

  async createChallengeTransaction(
    entryHash: string,
    reasonHash: string,
    amount: string | BN,
  ) {
    const { to, data, nonce } = await this.postRequestTCR('/challenge', {
      sender: await this.getAccount(),
      entryHash: entryHash,
      reasonHash: reasonHash,
      amount: BN.isBN(amount) ? amount.toString() : amount,
    })
    return this.createTransaction(to, data, true, nonce)
  }

  async createExitTransaction(dataHash: string) {
    const { to, data, nonce } = await this.postRequestTCR('/exit', {
      sender: await this.getAccount(),
      dataHash: dataHash,
    })
    return this.createTransaction(to, data, true, nonce)
  }

  async createCommitVoteTransaction(
    challengeId: number,
    yesVote: string | BN,
    noVote: string | BN,
    salt: string,
  ) {
    return this.voteClient.createCommitVoteTransaction(
      challengeId,
      yesVote,
      noVote,
      salt,
    )
  }

  async createRevealVoteTransaction(
    challengeId: number,
    yesVote: string | BN,
    noVote: string | BN,
    salt: string,
  ) {
    return this.voteClient.createRevealVoteTransaction(
      challengeId,
      yesVote,
      noVote,
      salt,
    )
  }

  async createClaimRewardTransaction(challengeId: number) {
    const { to, data } = await this.postRequestTCR('/claim-reward', {
      rewardOwner: await this.getAccount(),
      challengeId,
    })
    return this.createTransaction(to, data, false)
  }

  async getEntries(args: {
    status?: string
    proposer?: Address
    limit?: number
    entryHashes?: string[]
  }): Promise<Entry[]> {
    const result = await this.getRequestTCR('/entries', {
      status: args.status,
      proposer: args.proposer,
      limit: args.limit,
      entryHash: args.entryHashes,
    })
    return result.map((e: any) => ({
      ...e,
      deposit: new BN(e.deposit),
    }))
  }

  async getChallenges(args: {
    challenger?: Address
    challengeIds?: number[]
    entryHash?: string
  }): Promise<Challenge[]> {
    const result = await this.getRequestTCR('/challenge', {
      challenger: args.challenger,
      challengeId: args.challengeIds,
      entryHash: args.entryHash,
    })
    return result.map((e: any) => {
      const challenge = {
        ...e,
        stake: new BN(e.stake),
        minParticipation: new BN(e.minParticipation),
        currentParticipation: new BN(e.currentParticipation),
        currentYesVote: new BN(e.currentYesVote),
        currentNoVote: new BN(e.currentNoVote),
      }

      if (
        e.status === 'SUCCEES' ||
        e.status === 'FAILED' ||
        e.status === 'INCONCLUSIVE'
      ) {
        challenge.voterReward = new BN(e.voterReward)
        challenge.leaderReward = new BN(e.leaderReward)
      }
      return challenge
    })
  }

  async getVotes(args: { voter?: Address; challengeIds?: number[] }) {
    return await this.voteClient.getVotes(args.voter, args.challengeIds)
  }

  async getEntryHistory(args: { entryHash?: string }) {
    const result = await this.getRequestTCR('/entry-history', args)
    return result.map((e: any) => ({
      ...e,
      depositChanged: new BN(e.depositChanged),
    }))
  }

  async getVotingPower(challengeId: number) {
    return await this.voteClient.getVotingPower(challengeId)
  }

  private async getRequestTCR(path: string, params?: any): Promise<any> {
    return await InternalUtils.getRequest(
      `/tcr/${this.tcrAddress}${path}`,
      params,
    )
  }
  private async postRequestTCR(path: string, data: any): Promise<any> {
    return await InternalUtils.postRequest(
      `/tcr/${this.tcrAddress}${path}`,
      data,
    )
  }

  async createSalt(challengeId: number) {
    if (this.web3 === undefined)
      return InternalUtils.throw('Required provider.')
    return this.web3.utils.soliditySha3(
      await InternalUtils.signMessage(
        this.web3,
        `salt:${this.tcrAddress}:${challengeId}`,
        await this.getAccount(),
      ),
    )
  }
}

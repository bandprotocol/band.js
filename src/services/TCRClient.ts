import BaseClient from './BaseClient'
import VoteClient from './VoteClient'
import Web3 from 'web3'
import InternalUtils from './InternalUtils'
import BN from 'bn.js'
import { Address, EntryWithStake, ChallengeInit, CommitVote, RevealVote } from '../typing/index'

export default class TCRClient extends BaseClient {
  private tcrAddress: Address
  private voteClient: VoteClient

  constructor(tcrAddress: Address, web3?: Web3) {
    super(web3)
    this.tcrAddress = tcrAddress
    this.voteClient = new VoteClient(tcrAddress, web3)
  }

  async createApplyTransaction({ dataHash, amount }: EntryWithStake) {
    const { to, data, lastTimestamp } = await this.postRequestTCR('/entries', {
      sender: await this.getAccount(),
      dataHash: dataHash,
      deposit: BN.isBN(amount) ? amount.toString() : amount,
    })
    return this.createTransaction(to, data, true, lastTimestamp)
  }

  async createDepositTransaction({ dataHash, amount }: EntryWithStake) {
    const { to, data, lastTimestamp } = await this.postRequestTCR('/deposit', {
      sender: await this.getAccount(),
      dataHash: dataHash,
      amount: BN.isBN(amount) ? amount.toString() : amount,
    })
    return this.createTransaction(to, data, true, lastTimestamp)
  }

  async createWithdrawTransaction({ dataHash, amount }: EntryWithStake) {
    const { to, data, lastTimestamp } = await this.postRequestTCR('/withdraw', {
      sender: await this.getAccount(),
      dataHash: dataHash,
      amount: BN.isBN(amount) ? amount.toString() : amount,
    })
    return this.createTransaction(to, data, true, lastTimestamp)
  }

  async createChallengeTransaction({ entryHash, reasonHash, amount }: ChallengeInit) {
    const { to, data, lastTimestamp } = await this.postRequestTCR('/challenge', {
      sender: await this.getAccount(),
      entryHash: entryHash,
      reasonHash: reasonHash,
      amount: BN.isBN(amount) ? amount.toString() : amount,
    })
    return this.createTransaction(to, data, true, lastTimestamp)
  }

  async createExitTransaction(dataHash: string) {
    const { to, data, lastTimestamp } = await this.postRequestTCR('/exit', {
      sender: await this.getAccount(),
      dataHash: dataHash,
    })
    return this.createTransaction(to, data, true, lastTimestamp)
  }

  async createCommitVoteTransaction({ challengeId, commitHash, totalWeight }: CommitVote) {
    return this.voteClient.createCommitVoteTransaction(
      challengeId,
      commitHash,
      totalWeight,
    )
  }

  async createRevealVoteTransaction({ challengeId, yesVote, noVote, salt }: RevealVote) {
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

  async getVotingPower(challengeId: number) {
    return await this.voteClient.getVotingPower(challengeId)
  }

  async getMinDeposit(entryHash: string): Promise<BN> {
    return new BN(
      (await this.getRequestTCR(`/${entryHash}/min-deposit`, {})).minDeposit,
    )
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

  async createSalt(challengeId: number): Promise<BN> {
    if (this.web3 === undefined)
      return InternalUtils.throw('Required provider.')
    return new BN(
      this.web3.utils
        .soliditySha3(
          await InternalUtils.signMessage(
            this.web3,
            this.web3.utils.asciiToHex(
              `salt:${this.tcrAddress}:${challengeId}`,
            ),
            await this.getAccount(),
          ),
        )
        .slice(2),
      'hex',
    )
  }
}

import BaseClient from './BaseClient'
import VoteClient from './VoteClient'
import Web3 from 'web3'
import Utils from './Utils'
import BN from 'bn.js'
import { Address } from '../typing'

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

  //   private async getRequestTCR(path: string, params?: any): Promise<any> {
  //     return await Utils.getRequest(`/tcr/${this.tcrAddress}${path}`, params)
  //   }
  private async postRequestTCR(path: string, data: any): Promise<any> {
    return await Utils.postRequest(`/tcr/${this.tcrAddress}${path}`, data)
  }
}

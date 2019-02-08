import _ from 'lodash'
import Web3 from 'web3'
import BN from 'bn.js'
import BaseClient from './BaseClient'
import {
  OrderHistory,
  Address,
  Equation,
  PriceHistory,
  Parameter,
  Proposal,
  VoteResult,
  RewardDetail,
} from '../typing/index'

export default class CommunityClient extends BaseClient {
  private coreAddress?: Address

  constructor(web3?: Web3, coreAddress?: Address) {
    super(web3)
    this.coreAddress = coreAddress
  }

  async getBalance(): Promise<BN> {
    const account = await this.getAccount()
    const result = await this.getRequestDApps(`/balance/${account}`)
    return new BN(result.balance)
  }

  async getBuyPrice(amount: string | BN): Promise<BN> {
    const amountString = BN.isBN(amount) ? amount.toString() : amount
    const url = `/buy-price/${amountString}`
    return new BN((await this.getRequestDApps(url)).price)
  }

  async getSellPrice(amount: string | BN): Promise<BN> {
    const amountString = BN.isBN(amount) ? amount.toString() : amount
    const url = `/sell-price/${amountString}`
    return new BN((await this.getRequestDApps(url)).price)
  }

  async getOrderHistory(args: {
    limit?: number
    user?: Address
    type?: 'buy' | 'sell'
  }): Promise<OrderHistory[]> {
    const result: any[] = await this.getRequestDApps('/order-history', args)
    return result.map((e: OrderHistory) => ({
      ...e,
      value: new BN(e.value),
      price: new BN(e.price),
    }))
  }

  async getPriceHistory(args: { limit?: number }): Promise<PriceHistory[]> {
    const result: any[] = await this.getRequestDApps('/price-history', args)
    return result.map((e: any) => ({
      time: e.time,
      price: parseFloat(e.price),
    }))
  }

  async reportDetail({
    name,
    symbol,
    logo,
    description,
    website,
    author,
    priceEquation,
  }: {
    name: string
    symbol: string
    logo: string
    description: string
    website: string
    author: string
    priceEquation: Equation
  }) {
    await this.postRequestDApps(`/detail`, {
      name,
      symbol,
      logo,
      description,
      website,
      author,
      priceEquation,
    })
  }

  async createTransferTransaction(to: Address, value: string | BN) {
    const valueString = BN.isBN(value) ? value.toString() : value
    const { to: tokenAddress, data } = await this.postRequestDApps(
      '/transfer',
      {
        to: to,
        value: valueString,
      },
    )

    return this.createTransaction(tokenAddress, data)
  }

  async createBuyTransaction(amount: string | BN, priceLimit: string | BN) {
    const amountString = BN.isBN(amount) ? amount.toString() : amount
    const priceLimitString = BN.isBN(priceLimit)
      ? priceLimit.toString()
      : priceLimit
    const { to: tokenAddress, data } = await this.postRequestDApps('/buy', {
      value: amountString,
      priceLimit: priceLimitString,
    })
    return this.createTransaction(tokenAddress, data)
  }

  async createSellTransaction(amount: string | BN, priceLimit: string | BN) {
    const amountString = BN.isBN(amount) ? amount.toString() : amount
    const priceLimitString = BN.isBN(priceLimit)
      ? priceLimit.toString()
      : priceLimit
    const { to: tokenAddress, data } = await this.postRequestDApps('/sell', {
      value: amountString,
      priceLimit: priceLimitString,
    })
    return this.createTransaction(tokenAddress, data)
  }

  async createNewRewardTransaction(keys: Address[], values: number[]) {
    const { rootHash } = await this.postRequestMerkle('', {
      keys,
      values,
    })

    const { to: tokenAddress, data } = await this.postRequestDApps(
      '/add-reward',
      {
        rootHash: rootHash,
        totalPortion: _.sum(values),
      },
    )

    return this.createTransaction(tokenAddress, data)
  }

  async getRewardDetail(rewardID: number): Promise<RewardDetail> {
    const rewards = await this.getRequestDApps(`/rewards`)
    return rewards.filter((reward: any) => reward.rewardID === rewardID)[0]
  }

  async createClaimRewardTransaction(rewardID: number) {
    const { rootHash } = await this.getRewardDetail(rewardID)
    const account = await this.getAccount()
    const proof = await this.getRequestMerkle(`/${rootHash}/proof/${account}`)
    const kvs = await this.getRequestMerkle(`/${rootHash}`, {
      key: account,
    })
    if (kvs.length === 0) {
      this.throw('Reward not found')
    }
    const { to: tokenAddress, data } = await this.postRequestDApps(`/rewards`, {
      rewardID,
      beneficiary: account,
      rewardPortion: kvs[0].value,
      proof,
    })
    return this.createTransaction(tokenAddress, data)
  }

  async getRewards(): Promise<RewardDetail[]> {
    const rewards: RewardDetail[] = await this.getRequestDApps(`/rewards`)
    if (!this.isLogin()) return rewards
    const user = await this.getAccount()
    for (const reward of rewards) {
      const claim = await this.getRequestDApps(
        `/rewards/${reward.rewardID}/claim/${user}`,
      )
      if (claim.claimed) {
        reward.claimed = true
        reward.amount = claim.amount
      } else {
        const kvs = await this.getRequestMerkle(`/${reward.rootHash}`, {
          key: user,
        })
        reward.claimed = false
        reward.amount = kvs.length === 0 ? 0 : kvs[0].value
      }
    }
    return rewards
  }

  async getParameters(): Promise<Parameter[]> {
    const result = await this.getRequestDApps('/parameters')
    return result.map((e: { key: string; value: string }) => ({
      ...e,
      value: new BN(e.value),
    }))
  }

  async getProposals(): Promise<Proposal[]> {
    const result = await this.getRequestDApps('/proposals')
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

  async getVoteResultProposals(): Promise<VoteResult[]> {
    const account = await this.getAccount()
    const result = await this.getRequestDApps(`/proposals/vote/${account}`)
    return result.map((e: any) => ({
      ...e,
      yesVote: new BN(e.yesVote),
      noVote: new BN(e.noVote),
    }))
  }

  async createProposalTransaction(keys: string[], values: (string | BN)[]) {
    const { to: tokenAddress, data } = await this.postRequestDApps(
      '/proposals',
      {
        keys,
        values: values.map((e: string | BN) => (BN.isBN(e) ? e.toString() : e)),
      },
    )
    return this.createTransaction(tokenAddress, data)
  }

  async createVoteProposalTransaction(
    proposalID: number,
    yesVote: string | BN,
    noVote: string | BN,
  ) {
    const { to: tokenAddress, data } = await this.postRequestDApps(
      `/proposals/${proposalID}/vote`,
      {
        yesVote: BN.isBN(yesVote) ? yesVote.toString() : yesVote,
        noVote: BN.isBN(noVote) ? noVote.toString() : noVote,
      },
    )
    return this.createTransaction(tokenAddress, data)
  }

  private async getRequestDApps(path: string, params?: any): Promise<any> {
    return await this.getRequest(`/dapps/${this.coreAddress}${path}`, params)
  }
  private async postRequestDApps(path: string, data: any): Promise<any> {
    return await this.postRequest(`/dapps/${this.coreAddress}${path}`, data)
  }
  private async getRequestMerkle(path: string, params?: any): Promise<any> {
    return await this.getRequest(`/merkle${path}`, params)
  }
  private async postRequestMerkle(path: string, data: any): Promise<any> {
    return await this.postRequest(`/merkle${path}`, data)
  }
}

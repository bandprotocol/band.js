import _ from 'lodash'
import Web3 from 'web3'
import BN from 'bn.js'
import BaseClient from './BaseClient'
import ParameterClient from './ParameterClient'
import TCRClient from './TCRClient'
import InternalUtils from './InternalUtils'
import {
  OrderHistory,
  Address,
  Equation,
  PriceHistory,
  RewardDetail,
} from '../typing'

export default class CommunityClient extends BaseClient {
  private coreAddress: Address

  constructor(coreAddress: Address, web3?: Web3) {
    super(web3)
    this.coreAddress = coreAddress
  }

  async getBalance(): Promise<BN> {
    const account = await this.getAccount()
    const result = await this.getRequestDApps(`/balance/${account}`)
    return new BN(result.balance)
  }

  async getBalanceQL(): Promise<BN> {
    const account = await this.getAccount()
    const { community } = await InternalUtils.graphqlRequest(
      `{
        community(address: "${this.coreAddress}") {
          token {
            balances(filteredBy:{
              users:["${account}"]
            }) {
              value
            }
          }
        }
      }
    `,
    )
    return community.token.balances[0].value
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

  async getOrderHistoryQL(args: {
    user?: Address
    type?: 'BUY' | 'SELL'
  }): Promise<OrderHistory[]> {
    // TODO : add limit filter
    const { user, type } = args
    const { community } = await InternalUtils.graphqlRequest(
      `
      {
        community(address: "${this.coreAddress}") {
          orderHistory(filteredBy:{
            ${(() => (user ? `users: [${user}],` : ``))()}
            ${(() => (type ? `orderTypes: [${type}],` : ``))()}
          }) {
            orderType
            user {
              address
            }
            value
            price
            tx {
              blockTimestamp
              txHash
            }
          }
        }
      }`,
    )
    const { orderHistory } = community
    return orderHistory.map((history: any) => {
      return {
        orderType: history.orderType,
        ...history.user,
        value: new BN(history.value),
        price: new BN(history.price),
        blockTime: history.tx.blockTimestamp,
        txHash: history.tx.txHash,
      }
    })
  }

  async getPriceHistory(args: { limit?: number }): Promise<PriceHistory[]> {
    const result: any[] = await this.getRequestDApps('/price-history', args)
    return result.map((e: any) => ({
      time: e.time,
      price: parseFloat(e.price),
    }))
  }

  async getPriceHistoryQL(): Promise<PriceHistory[]> {
    // TODO : add limit filter
    const { community } = await InternalUtils.graphqlRequest(
      `{
        community(address: "${this.coreAddress}") {
          priceHistory {
            price
            tx {
              blockTimestamp
            }
          }
        }
      }
      `,
    )
    const { priceHistory } = community
    return priceHistory.map((history: any) => {
      return {
        time: history.tx.blockTimestamp,
        price: history.price,
      }
    })
  }

  async reportDetail({
    name,
    symbol,
    logo,
    description,
    website,
    author,
    collateralEquation,
  }: {
    name: string
    symbol: string
    logo: string
    description: string
    website: string
    author: string
    collateralEquation: Equation
  }) {
    await this.postRequestDApps(`/detail`, {
      name,
      symbol,
      logo,
      description,
      website,
      author,
      collateralEquation,
    })
  }

  async createTransferTransaction(to: Address, value: string | BN) {
    const valueString = BN.isBN(value) ? value.toString() : value
    const { to: tokenAddress, data, nonce } = await this.postRequestDApps(
      '/transfer',
      {
        sender: await this.getAccount(),
        to: to,
        value: valueString,
      },
    )
    return this.createTransaction(tokenAddress, data, true, nonce)
  }

  async createBuyTransaction(amount: string | BN, priceLimit: string | BN) {
    const amountString = BN.isBN(amount) ? amount.toString() : amount
    const priceLimitString = BN.isBN(priceLimit)
      ? priceLimit.toString()
      : priceLimit
    const { to: tokenAddress, data, nonce } = await this.postRequestDApps(
      '/buy',
      {
        sender: await this.getAccount(),
        value: amountString,
        priceLimit: priceLimitString,
      },
    )
    return this.createTransaction(tokenAddress, data, true, nonce)
  }

  async createSellTransaction(amount: string | BN, priceLimit: string | BN) {
    const amountString = BN.isBN(amount) ? amount.toString() : amount
    const priceLimitString = BN.isBN(priceLimit)
      ? priceLimit.toString()
      : priceLimit
    const { to: tokenAddress, data, nonce } = await this.postRequestDApps(
      '/sell',
      {
        sender: await this.getAccount(),
        value: amountString,
        priceLimit: priceLimitString,
      },
    )
    return this.createTransaction(tokenAddress, data, true, nonce)
  }

  async createNewRewardTransaction(
    keys: Address[],
    values: number[],
    imageLink: string,
    detailLink: string,
    header: string,
    period: string,
  ) {
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
    const tx = await this.createTransaction(tokenAddress, data, false)
    const { logs } = await tx.send()
    if (!logs) return
    const rewardId = parseInt(logs[0].topics[1] as any) // TODO: Figure out why topics[1] can be string[]

    await this.reportRewardDetail({
      imageLink,
      detailLink,
      header,
      period,
      rewardId,
    })
  }

  async reportRewardDetail({
    imageLink,
    detailLink,
    header,
    period,
    rewardId,
  }: {
    imageLink: string
    detailLink: string
    header: string
    period: string
    rewardId: number
  }) {
    await this.postRequestDApps(`/rewards/${rewardId}/detail`, {
      imageLink,
      detailLink,
      header,
      period,
    })
  }

  async createClaimRewardTransaction(rewardId: number) {
    const { rootHash } = await this.getRewardDetail(rewardId)
    const account = await this.getAccount()
    const proof = await this.getRequestMerkle(`/${rootHash}/proof/${account}`)
    const kvs = await this.getRequestMerkle(`/${rootHash}`, {
      key: account,
    })
    if (kvs.length === 0) {
      InternalUtils.throw('Reward not found')
    }
    const { to: tokenAddress, data } = await this.postRequestDApps(`/rewards`, {
      rewardId,
      beneficiary: account,
      rewardPortion: kvs[0].value,
      proof,
    })
    return this.createTransaction(tokenAddress, data, false)
  }

  async getRewardDetail(rewardId: number): Promise<RewardDetail> {
    const rewards = await this.getRequestDApps(`/rewards`)
    return rewards.filter((reward: any) => reward.rewardId === rewardId)[0]
  }

  async getRewards(): Promise<RewardDetail[]> {
    const rawRewards: RewardDetail[] = await this.getRequestDApps(`/rewards`)
    const rewards = rawRewards.map((reward: RewardDetail) => ({
      ...reward,
      totalReward: new BN(reward.totalReward),
      totalPortion: new BN(reward.totalPortion),
    }))
    if (!this.isLogin()) return rewards
    const user = await this.getAccount()
    for (const reward of rewards) {
      const claim = await this.getRequestDApps(
        `/rewards/${reward.rewardId}/claim/${user}`,
      )
      if (claim.claimed) {
        reward.claimed = true
        reward.amount = new BN(claim.amount)
      } else {
        const kvs = await this.getRequestMerkle(`/${reward.rootHash}`, {
          key: user,
        })
        reward.claimed = false
        reward.amount =
          kvs.length === 0
            ? new BN(0)
            : new BN(kvs[0].value)
                .mul(reward.totalReward)
                .div(reward.totalPortion)
      }
    }
    return rewards
  }

  parameter() {
    return new ParameterClient(this.coreAddress, this.web3)
  }

  tcr(tcrAddress: Address) {
    return new TCRClient(tcrAddress, this.web3)
  }

  private async getRequestDApps(path: string, params?: any): Promise<any> {
    return await InternalUtils.getRequest(
      `/dapps/${this.coreAddress}${path}`,
      params,
    )
  }
  private async postRequestDApps(path: string, data: any): Promise<any> {
    return await InternalUtils.postRequest(
      `/dapps/${this.coreAddress}${path}`,
      data,
    )
  }
  private async getRequestMerkle(path: string, params?: any): Promise<any> {
    return await InternalUtils.getRequest(`/merkle${path}`, params)
  }
  private async postRequestMerkle(path: string, data: any): Promise<any> {
    return await InternalUtils.postRequest(`/merkle${path}`, data)
  }
}

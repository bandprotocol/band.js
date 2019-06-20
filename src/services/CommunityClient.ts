import _ from 'lodash'
import Web3 from 'web3'
import BN from 'bn.js'
// import delay from 'delay'
import BaseClient from './BaseClient'
import ParameterClient from './ParameterClient'
import TCRClient from './TCRClient'
import InternalUtils from './InternalUtils'
import TCDClient from './TCDClient'
import {
  Address,
  SendToken,
  BuySellType,
  ParameterProposal,
  CastVote,
} from '../typing/index'

export default class CommunityClient extends BaseClient {
  private tokenAddress: Address

  constructor(tokenAddress: Address, web3?: Web3) {
    super(web3)
    this.tokenAddress = tokenAddress
  }

  async getBuyPrice(amount: string | BN): Promise<BN> {
    const amountString = BN.isBN(amount) ? amount.toString() : amount
    const url = `/buy-price/${amountString}`
    return new BN((await this.getRequestToken(url)).price)
  }

  async getSellPrice(amount: string | BN): Promise<BN> {
    const amountString = BN.isBN(amount) ? amount.toString() : amount
    const url = `/sell-price/${amountString}`
    return new BN((await this.getRequestToken(url)).price)
  }

  async createTransferTransaction({ to, value }: SendToken) {
    const valueString = BN.isBN(value) ? value.toString() : value
    const { to: tokenAddress, data } = await this.postRequestToken(
      '/transfer',
      {
        to: to,
        value: valueString,
      },
    )
    return this.createTransaction(tokenAddress, data)
  }

  async createBuyTransaction({ amount, priceLimit }: BuySellType) {
    const amountString = BN.isBN(amount) ? amount.toString() : amount
    const priceLimitString = BN.isBN(priceLimit)
      ? priceLimit.toString()
      : priceLimit
    const { to: tokenAddress, data } = await this.postRequestToken('/buy', {
      value: amountString,
      priceLimit: priceLimitString,
    })
    return this.createTransaction(tokenAddress, data)
  }

  async createSellTransaction({ amount, priceLimit }: BuySellType) {
    const amountString = BN.isBN(amount) ? amount.toString() : amount
    const priceLimitString = BN.isBN(priceLimit)
      ? priceLimit.toString()
      : priceLimit
    const { to: tokenAddress, data } = await this.postRequestToken('/sell', {
      value: amountString,
      priceLimit: priceLimitString,
    })
    return this.createTransaction(tokenAddress, data)
  }

  async createProposeTransaction({
    reasonHash,
    keys,
    values,
  }: ParameterProposal) {
    return this.parameter().createProposalTransaction(reasonHash, keys, values)
  }

  async createProposalVoteTransaction({ proposalId, isAccepted }: CastVote) {
    return this.parameter().createCastVoteTransaction(proposalId, isAccepted)
  }

  // async createTCR({
  //   prefix,
  //   decayFunction,
  //   minDeposit,
  //   applyStageLength,
  //   dispensationPercentage,
  //   commitTime,
  //   revealTime,
  //   minParticipationPct,
  //   supportRequiredPct,
  // }: TCRDetail) {
  //   prefix += ':'
  //   const { to, data } = await this.postRequestToken('/create-tcr', {
  //     prefix,
  //     decayFunction,
  //     minDeposit,
  //     applyStageLength,
  //     dispensationPercentage,
  //     commitTime,
  //     revealTime,
  //     minParticipationPct,
  //     supportRequiredPct,
  //   })
  //   const tx = await this.createTransaction(to, data)
  //   return new Promise<TCRClient>((resolve, reject) =>
  //     tx.send().on('transactionHash', async tx_hash => {
  //       if (!this.web3) {
  //         reject()
  //         return
  //       }
  //       while (true) {
  //         const log = await this.web3.eth.getTransactionReceipt(tx_hash)
  //         console.log(log)
  //         if (log) {
  //           if (!log.status || !log.logs) {
  //             reject()
  //             return
  //           }
  //           const lastEvent = log.logs[log.logs.length - 1]
  //           resolve(
  //             this.tcr(
  //               this.web3.utils.toChecksumAddress(
  //                 '0x' + lastEvent.data.slice(26),
  //               ),
  //             ),
  //           )
  //           return
  //         } else {
  //           await delay(1000)
  //         }
  //       }
  //     }),
  //   )
  // }

  // async createTCD({
  //   minProviderStake,
  //   maxProviderCount,
  //   ownerRevenuePct,
  //   queryPrice,
  // }: TCDDetail) {
  //   const { to, data } = await this.postRequestToken('/create-tcd', {
  //     minProviderStake,
  //     maxProviderCount,
  //     ownerRevenuePct,
  //     queryPrice,
  //   })
  //   const tx = await this.createTransaction(to, data)
  //   return new Promise<TCDClient>((resolve, reject) =>
  //     tx.send().on('transactionHash', async tx_hash => {
  //       if (!this.web3) {
  //         reject()
  //         return
  //       }
  //       while (true) {
  //         const log = await this.web3.eth.getTransactionReceipt(tx_hash)
  //         console.log(log)
  //         if (log) {
  //           if (!log.status || !log.logs) {
  //             reject()
  //             return
  //           }
  //           const lastEvent = log.logs[log.logs.length - 1]
  //           resolve(
  //             this.tcd(
  //               this.web3.utils.toChecksumAddress(
  //                 '0x' + lastEvent.data.slice(26),
  //               ),
  //             ),
  //           )
  //           return
  //         } else {
  //           await delay(1000)
  //         }
  //       }
  //     }),
  //   )
  // }

  parameter() {
    return new ParameterClient(this.tokenAddress, this.web3)
  }

  tcr(tcrAddress: Address) {
    return new TCRClient(tcrAddress, this.web3)
  }

  tcd(tcdAddress: Address) {
    return new TCDClient(tcdAddress, this.web3)
  }

  private async getRequestToken(path: string, params?: any): Promise<any> {
    return await InternalUtils.getRequest(
      `/token/${this.tokenAddress}${path}`,
      params,
    )
  }
  private async postRequestToken(path: string, data: any): Promise<any> {
    return await InternalUtils.postRequest(
      `/token/${this.tokenAddress}${path}`,
      data,
    )
  }
}

import BaseClient from './BaseClient'
import Web3 from 'web3'
import InternalUtils from './InternalUtils'
import BN from 'bn.js'
import { Address, DataSourceWithStake, WithdrawOwnership } from '../typing/index'

export default class DDSClient extends BaseClient {
  private ddsAddress: Address

  constructor(ddsAddress: Address, web3?: Web3) {
    super(web3)
    this.ddsAddress = ddsAddress
  }

  async createRegisterDataSourceTransaction({ dataSource, stake }: DataSourceWithStake) {
    const { to, data, lastTimestamp } = await this.postRequestTCR('/register', {
      sender: await this.getAccount(),
      dataSource,
      stake: BN.isBN(stake) ? stake.toString() : stake,
    })
    return this.createTransaction(to, data, true, lastTimestamp)
  }

  async createVoteDataSourceTransaction({ dataSource, stake }: DataSourceWithStake) {
    const { to, data, lastTimestamp } = await this.postRequestTCR('/vote', {
      sender: await this.getAccount(),
      dataSource,
      stake: BN.isBN(stake) ? stake.toString() : stake,
    })
    return this.createTransaction(to, data, true, lastTimestamp)
  }

  async createWithdrawDataSourceTransaction({ dataSource, withdrawOwnership }: WithdrawOwnership) {
    const { to, data, lastTimestamp } = await this.postRequestTCR('/withdraw', {
      sender: await this.getAccount(),
      dataSource,
      withdrawOwnership: BN.isBN(withdrawOwnership) ? withdrawOwnership.toString() : withdrawOwnership,
    })
    return this.createTransaction(to, data, true, lastTimestamp)
  }

  async createKickDataSourceTransaction(dataSource: Address) {
    const { to, data, lastTimestamp } = await this.postRequestTCR('/kick', {
      dataSource
    })
    return this.createTransaction(to, data, true, lastTimestamp)
  }

  async createDistributeFeeTransaction(tokenAmount: string | BN) {
    const { to, data } = await this.postRequestTCR('/distribute-fee', {
      amount: BN.isBN(tokenAmount) ? tokenAmount.toString() : tokenAmount
    })
    return this.createTransaction(to, data, false)
  }

  private async postRequestTCR(path: string, data: any): Promise<any> {
    return await InternalUtils.postRequest(
      `/data/${this.ddsAddress}${path}`,
      data,
    )
  }
}

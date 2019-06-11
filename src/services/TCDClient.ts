import BaseClient from './BaseClient'
import Web3 from 'web3'
import InternalUtils from './InternalUtils'
import BN from 'bn.js'
import {
  Address,
  DataSourceWithStake,
  WithdrawOwnership,
} from '../typing/index'

export default class TCDClient extends BaseClient {
  private tcdAddress: Address

  constructor(tcdAddress: Address, web3?: Web3) {
    super(web3)
    this.tcdAddress = tcdAddress
  }

  async createRegisterDataSourceTransaction({
    dataSource,
    stake,
  }: DataSourceWithStake) {
    const { to, data } = await this.postRequestTCD('/register', {
      dataSource,
      stake: BN.isBN(stake) ? stake.toString() : stake,
    })
    return this.createTransaction(to, data)
  }

  async createVoteDataSourceTransaction({
    dataSource,
    stake,
  }: DataSourceWithStake) {
    const { to, data } = await this.postRequestTCD('/stake', {
      dataSource,
      stake: BN.isBN(stake) ? stake.toString() : stake,
    })
    return this.createTransaction(to, data)
  }

  async createWithdrawDataSourceTransaction({
    dataSource,
    withdrawOwnership,
  }: WithdrawOwnership) {
    const { to, data } = await this.postRequestTCD('/unstake', {
      dataSource,
      withdrawOwnership: BN.isBN(withdrawOwnership)
        ? withdrawOwnership.toString()
        : withdrawOwnership,
    })
    return this.createTransaction(to, data)
  }

  async createDistributeFeeTransaction(tokenAmount: string | BN) {
    const { to, data } = await this.postRequestTCD('/distribute-fee', {
      amount: BN.isBN(tokenAmount) ? tokenAmount.toString() : tokenAmount,
    })
    return this.createTransaction(to, data)
  }

  private async postRequestTCD(path: string, data: any): Promise<any> {
    return await InternalUtils.postRequest(
      `/data/${this.tcdAddress}${path}`,
      data,
    )
  }
}

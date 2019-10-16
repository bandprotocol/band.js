import BaseClient from './BaseClient'
import Web3 from 'web3'
import BN from 'bn.js'
import Txgen from './Txgen'
import {
  Address,
  DataSourceWithStake,
  WithdrawOwnership,
  TokenLockQuery,
} from '../typing/index'
import InternalUtils from './InternalUtils'

const findPrevSource = ({}, {}): Address =>
  '0x0000000000000000000000000000000000000000'

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
    const stakeString = BN.isBN(stake) ? stake.toString() : stake
    return this.createTransaction(
      this.tcdAddress,
      Txgen.createTransactionData(
        'register(address,address,uint256)',
        ['address', 'address', 'uint256'],
        [dataSource, findPrevSource(this.tcdAddress, dataSource), stakeString],
      ),
    )
  }

  async createVoteDataSourceTransaction({
    dataSource,
    stake,
  }: DataSourceWithStake) {
    const stakeString = BN.isBN(stake) ? stake.toString() : stake
    return this.createTransaction(
      this.tcdAddress,
      Txgen.createTransactionData(
        'stake(address,address,address,uint256)',
        ['address', 'address', 'address', 'uint256'],
        [
          dataSource,
          findPrevSource(this.tcdAddress, dataSource),
          findPrevSource(this.tcdAddress, dataSource),
          stakeString,
        ],
      ),
    )
  }

  async createWithdrawDataSourceTransaction({
    dataSource,
    withdrawOwnership,
  }: WithdrawOwnership) {
    const withdrawOwnershipString = BN.isBN(withdrawOwnership)
      ? withdrawOwnership.toString()
      : withdrawOwnership
    return this.createTransaction(
      this.tcdAddress,
      Txgen.createTransactionData(
        'unstake(address,address,address,uint256)',
        ['address', 'address', 'address', 'uint256'],
        [
          dataSource,
          findPrevSource(this.tcdAddress, dataSource),
          findPrevSource(this.tcdAddress, dataSource),
          withdrawOwnershipString,
        ],
      ),
    )
  }

  async createDistributeFeeTransaction(tokenAmount: string | BN) {
    const tokenAmountString = BN.isBN(tokenAmount)
      ? tokenAmount.toString()
      : tokenAmount
    return this.createTransaction(
      this.tcdAddress,
      Txgen.createTransactionData(
        'distributeFee(uint256)',
        ['uint256'],
        [tokenAmountString],
      ),
    )
  }

  async getTokenLock({ account, dataSource }: TokenLockQuery) {
    if (!this.web3) {
      return InternalUtils.throw('Required provider.')
    }
    const mapBase = this.web3.utils
      .toBN(
        this.web3.utils.soliditySha3(
          this.web3.utils.padLeft(dataSource, 64, '0') +
            this.web3.utils.padLeft('1', 64, '0'),
        ),
      )
      .add(new BN(3))
    const newLocation = this.web3.utils.toBN(
      this.web3.utils.soliditySha3(this.web3.utils.padLeft(account, 64, '0'), {
        type: 'uint256',
        value: mapBase.toString(),
      }),
    )
    return this.web3.utils.toBN(
      await this.web3.eth.getStorageAt(this.tcdAddress, newLocation),
    )
  }

  async getStatus(dataSource: Address) {
    if (!this.web3) {
      return InternalUtils.throw('Required provider.')
    }
    // Check active provider
    const activeLocation = this.web3.utils.toBN(
      this.web3.utils.soliditySha3(
        this.web3.utils.padLeft(dataSource, 64, '0') +
          this.web3.utils.padLeft('2', 64, '0'),
      ),
    )
    const activeResult = this.web3.utils.toBN(
      await this.web3.eth.getStorageAt(this.tcdAddress, activeLocation),
    )

    if (!activeResult.eq(new BN(0))) {
      return 'ACTIVE'
    }

    const reserveLocation = this.web3.utils.toBN(
      this.web3.utils.soliditySha3(
        this.web3.utils.padLeft(dataSource, 64, '0') +
          this.web3.utils.padLeft('3', 64, '0'),
      ),
    )
    const reserveResult = this.web3.utils.toBN(
      await this.web3.eth.getStorageAt(this.tcdAddress, reserveLocation),
    )
    if (reserveResult.eq(new BN(0))) {
      return 'DISABLED'
    } else {
      return 'RESERVED'
    }
  }
}

import _ from 'lodash'
import Web3 from 'web3'
import BN from 'bn.js'
import BaseClient from './BaseClient'
import ParameterClient from './ParameterClient'
import TCRClient from './TCRClient'
import InternalUtils from './InternalUtils'
import IPFS from './IPFS'
import { Address } from '../typing'

export default class CommunityClient extends BaseClient {
  private coreAddress: Address

  constructor(coreAddress: Address, web3?: Web3) {
    super(web3)
    this.coreAddress = coreAddress
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

  async deployTCR(
    prefix: string,
    params: object,
    minDepositEquation: (string | BN)[],
  ) {
    prefix += ':'
    const { allContracts } = await InternalUtils.graphqlRequest(
      `
      {
        allContracts(condition: {contractType: "CR_VOTING"}) {
          nodes {
            address
          }
        }
      }`,
    )
    const voting = allContracts.nodes[0].address
    const { to, data } = await this.postRequestDApps('/create-tcr', {
      prefix,
      voting,
      minDepositEquation,
    })
    const tx = await this.createTransaction(to, data, false)
    await new Promise((resolve, reject) =>
      tx.send().on('receipt', async receipt => {
        if (!receipt.logs) {
          reject()
          return
        }
        const tcrAddress = receipt.logs && receipt.logs[0].data.slice(0, 66)
        console.log(tcrAddress)
        const parameterClient = this.parameter()
        const paramTx = await parameterClient.createProposalTransaction(
          await IPFS.set(
            JSON.stringify({
              title: `Initialize parameter for tcr with prefix ${prefix}`,
              reason: `Initialize parameter for new tcr address ${'0x' +
                tcrAddress.slice(26)}.`,
            }),
          ),
          [
            ...Object.keys(params).map(key => prefix + key),
            `${prefix}tcr_address`,
          ],
          [...Object.values(params), tcrAddress],
        )
        paramTx.send().on('receipt', _ => {
          resolve('0x' + tcrAddress.slice(26))
        })
      }),
    )
  }

  // async createNewRewardTransaction(
  //   keys: Address[],
  //   values: number[],
  //   imageLink: string,
  //   detailLink: string,
  //   header: string,
  //   period: string,
  // ) {
  //   const { rootHash } = await this.postRequestMerkle('', {
  //     keys,
  //     values,
  //   })

  //   const { to: tokenAddress, data } = await this.postRequestDApps(
  //     '/add-reward',
  //     {
  //       rootHash: rootHash,
  //       totalPortion: _.sum(values),
  //     },
  //   )
  //   const tx = await this.createTransaction(tokenAddress, data, false)
  //   const { logs } = await tx.send()
  //   if (!logs) return
  //   const rewardId = parseInt(logs[0].topics[1] as any) // TODO: Figure out why topics[1] can be string[]

  //   await this.reportRewardDetail({
  //     imageLink,
  //     detailLink,
  //     header,
  //     period,
  //     rewardId,
  //   })
  // }

  // async reportRewardDetail({
  //   imageLink,
  //   detailLink,
  //   header,
  //   period,
  //   rewardId,
  // }: {
  //   imageLink: string
  //   detailLink: string
  //   header: string
  //   period: string
  //   rewardId: number
  // }) {
  //   await this.postRequestDApps(`/rewards/${rewardId}/detail`, {
  //     imageLink,
  //     detailLink,
  //     header,
  //     period,
  //   })
  // }

  // async createClaimRewardTransaction(rewardId: number) {
  //   const { rootHash } = await this.getRewardDetail(rewardId)
  //   const account = await this.getAccount()
  //   const proof = await this.getRequestMerkle(`/${rootHash}/proof/${account}`)
  //   const kvs = await this.getRequestMerkle(`/${rootHash}`, {
  //     key: account,
  //   })
  //   if (kvs.length === 0) {
  //     InternalUtils.throw('Reward not found')
  //   }
  //   const { to: tokenAddress, data } = await this.postRequestDApps(`/rewards`, {
  //     rewardId,
  //     beneficiary: account,
  //     rewardPortion: kvs[0].value,
  //     proof,
  //   })
  //   return this.createTransaction(tokenAddress, data, false)
  // }

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
  // private async getRequestMerkle(path: string, params?: any): Promise<any> {
  //   return await InternalUtils.getRequest(`/merkle${path}`, params)
  // }
  // private async postRequestMerkle(path: string, data: any): Promise<any> {
  //   return await InternalUtils.postRequest(`/merkle${path}`, data)
  // }
}

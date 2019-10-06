// import BaseClient from './BaseClient'
// import Web3 from 'web3'
// import InternalUtils from './InternalUtils'
// import BN from 'bn.js'
// import {
//   Address,
//   EntryWithStake,
//   ChallengeInit,
//   CommitVote,
//   RevealVote,
// } from '../typing/index'

// export default class TCRClient extends BaseClient {
//   private tcrAddress: Address

//   constructor(tcrAddress: Address, web3?: Web3) {
//     super(web3)
//     this.tcrAddress = tcrAddress
//   }

//   async createApplyTransaction({ dataHash, amount }: EntryWithStake) {
//     const { to, data } = await this.postRequestTCR('/entries', {
//       dataHash: dataHash,
//       deposit: BN.isBN(amount) ? amount.toString() : amount,
//     })
//     return this.createTransaction(to, data)
//   }

//   async createDepositTransaction({ dataHash, amount }: EntryWithStake) {
//     const { to, data } = await this.postRequestTCR('/deposit', {
//       dataHash: dataHash,
//       amount: BN.isBN(amount) ? amount.toString() : amount,
//     })
//     return this.createTransaction(to, data)
//   }

//   async createWithdrawTransaction({ dataHash, amount }: EntryWithStake) {
//     const { to, data } = await this.postRequestTCR('/withdraw', {
//       dataHash: dataHash,
//       amount: BN.isBN(amount) ? amount.toString() : amount,
//     })
//     return this.createTransaction(to, data)
//   }

//   async createChallengeTransaction({
//     entryHash,
//     reasonHash,
//     amount,
//   }: ChallengeInit) {
//     const { to, data } = await this.postRequestTCR('/challenge', {
//       entryHash: entryHash,
//       reasonHash: reasonHash,
//       amount: BN.isBN(amount) ? amount.toString() : amount,
//     })
//     return this.createTransaction(to, data)
//   }

//   async createExitTransaction(dataHash: string) {
//     const { to, data } = await this.postRequestTCR('/exit', {
//       dataHash,
//     })
//     return this.createTransaction(to, data)
//   }

//   async createCommitVoteTransaction({ challengeId, commitHash }: CommitVote) {
//     const { to, data } = await this.postRequestTCR(
//       `/${challengeId}/commit-vote`,
//       {
//         commitHash,
//       },
//     )
//     return this.createTransaction(to, data)
//   }

//   async createRevealVoteTransaction({
//     challengeId,
//     voteKeep,
//     salt,
//   }: RevealVote) {
//     const { to, data } = await this.postRequestTCR(
//       `/${challengeId}/reveal-vote`,
//       {
//         voter: await this.getAccount(),
//         voteKeep,
//         salt: BN.isBN(salt) ? salt.toString() : salt,
//       },
//     )
//     return this.createTransaction(to, data)
//   }

//   async createClaimRewardTransaction(challengeId: number) {
//     const { to, data } = await this.postRequestTCR('/claim-reward', {
//       rewardOwner: await this.getAccount(),
//       challengeId,
//     })
//     return this.createTransaction(to, data)
//   }

//   async getMinDeposit(entryHash: string): Promise<BN> {
//     return new BN(
//       (await this.getRequestTCR(`/${entryHash}/min-deposit`, {})).minDeposit,
//     )
//   }

//   private async getRequestTCR(path: string, params?: any): Promise<any> {
//     return await InternalUtils.getRequest(
//       `/tcr/${this.tcrAddress}${path}`,
//       params,
//     )
//   }
//   private async postRequestTCR(path: string, data: any): Promise<any> {
//     return await InternalUtils.postRequest(
//       `/tcr/${this.tcrAddress}${path}`,
//       data,
//     )
//   }

//   async createSalt(challengeId: number): Promise<BN> {
//     if (this.web3 === undefined)
//       return InternalUtils.throw('Required provider.')
//     return new BN(
//       this.web3.utils
//         .soliditySha3(
//           await InternalUtils.signMessage(
//             this.web3,
//             this.web3.utils.asciiToHex(
//               `salt:${this.tcrAddress}:${challengeId}`,
//             ),
//             await this.getAccount(),
//           ),
//         )
//         .slice(2),
//       'hex',
//     )
//   }
// }

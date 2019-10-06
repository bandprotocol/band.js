import BaseClient from './BaseClient'
import Web3 from 'web3'
import InternalUtils from './InternalUtils'
import BN from 'bn.js'
import Txgen from './Txgen'

import { Address, ParameterProposal, CastVote } from '../typing/index'

export default class ParameterClient extends BaseClient {
  private parameterAddress: Address

  constructor(parameterAddress: Address, web3?: Web3) {
    super(web3)
    this.parameterAddress = parameterAddress
  }

  async createProposalTransaction({
    reasonHash,
    keys,
    values,
  }: ParameterProposal) {
    if (!this.web3) {
      return InternalUtils.throw('Required provider.')
    }
    return this.createTransaction(
      this.parameterAddress,
      Txgen.createTransactionData(
        'propose(bytes32,bytes32[],uint256[])',
        ['bytes32', 'bytes32[]', 'uint256[]'],
        [
          reasonHash,
          keys.map(k => (this.web3 ? this.web3.utils.asciiToHex(k) : '')),
          values.map(v => (BN.isBN(v) ? v.toString() : v)),
        ],
      ),
    )
  }

  async createCastVoteTransaction({ proposalId, isAccepted }: CastVote) {
    if (!this.web3) {
      return InternalUtils.throw('Required provider.')
    }
    return this.createTransaction(
      this.parameterAddress,
      Txgen.createTransactionData(
        'vote(uint256,bool)',
        ['uint256', 'bool'],
        [proposalId, isAccepted],
      ),
    )
  }
}

import BaseClient from './BaseClient'
import VoteClient from './VoteClient'
import Web3 from 'web3'
import InternalUtils from './InternalUtils'
import BN from 'bn.js'

import { Address, Parameter, Proposal, VoteResult } from '../typing'

export default class ParameterClient extends BaseClient {
  private coreAddress: Address
  private voteClient: VoteClient

  constructor(coreAddress: Address, web3?: Web3) {
    super(web3)
    this.coreAddress = coreAddress
    this.voteClient = new VoteClient(coreAddress, web3)
  }

  async getParameters(): Promise<Parameter[]> {
    const result = await this.getRequestParameter()
    return result.map((e: { key: string; value: string }) => ({
      ...e,
      value: new BN(e.value),
    }))
  }

  async getParametersQL(): Promise<Parameter[]> {
    const { community } = await InternalUtils.graphqlRequest(
      `
    {
      community(address: "${this.coreAddress}") {
        config {
          subConfigs {
            keyValues {
              key
              value
            }
          }
        }
      }
    }
    `,
    )
    const { subConfigs } = community.config
    const kvs = subConfigs.reduce(
      (acc: any, subConfig: any) => acc.concat(subConfig.keyValues),
      [],
    )
    return kvs.map((kv: any) => {
      return {
        key: kv.key,
        value: new BN(kv.value),
      }
    })
  }

  async getProposals(): Promise<Proposal[]> {
    const result = await this.getRequestParameter('/proposals')
    return result.map((e: any) => ({
      ...e,
      changes: e.changes.map((i: { key: string; value: string }) => ({
        ...i,
        value: new BN(i.value),
      })),
      yesVote: new BN(e.yesVote),
      noVote: new BN(e.noVote),
      minParticipation: new BN(e.minParticipation),
      supportRequiredPct: new BN(e.supportRequiredPct),
      totalVotingPower: new BN(e.totalVotingPower),
    }))
  }

  async getProposalsQL(): Promise<Proposal[]> {
    const { community } = await InternalUtils.graphqlRequest(
      `
      {
        community(address:"${this.coreAddress}") {
          config {
            proposals{
              onChainId
              reasonHash
              proposer {
                address
              }
              changes {
                key
                value
              }
              poll {
                yesWeight
                noWeight
                status
                ... on SimplePoll {
                  pollEndTime
                }
              }
            }
          }
        }
      }
    `,
    )
    const { proposals } = community.config
    return proposals.map((proposal: any) => ({
      proposalId: proposal.onChainId,
      reasonHash: proposal.reasonHash,
      proposer: proposal.proposer.address,
      changes: proposal.changes,
      yesVote: new BN(proposal.poll.yesWeight),
      noVote: new BN(proposal.poll.noWeight),
      pollEndTime: proposal.poll.pollEndTime,
      status: proposal.poll.status,
    }))
  }

  async getVotes(args: { voter?: Address; proposalIds?: number[] }) {
    return await this.voteClient.getVotes(args.voter, args.proposalIds)
  }

  async getVotingPower(proposalId: number) {
    return await this.voteClient.getVotingPower(proposalId)
  }

  //TODO: recheck it
  async getVoteResultProposals(): Promise<VoteResult[]> {
    const account = await this.getAccount()
    const result = await this.getRequestParameter(`/proposals/vote/${account}`)
    return result.map((e: any) => ({
      ...e,
      yesVote: new BN(e.yesVote),
      noVote: new BN(e.noVote),
    }))
  }

  async createProposalTransaction(
    reasonHash: string,
    keys: string[],
    values: (string | BN)[],
  ) {
    const { to: tokenAddress, data, nonce } = await this.postRequestParameter(
      '/proposals',
      {
        sender: await this.getAccount(),
        reasonHash,
        keys,
        values: values.map((e: string | BN) => (BN.isBN(e) ? e.toString() : e)),
      },
    )
    return this.createTransaction(tokenAddress, data, true, nonce)
  }

  async createCastVoteTransaction(
    proposalId: number,
    yesVote: string | BN,
    noVote: string | BN,
  ) {
    return this.voteClient.createCastVoteTransaction(
      proposalId,
      yesVote,
      noVote,
    )
  }

  private async getRequestParameter(path?: string, params?: any): Promise<any> {
    const sendPath = path === undefined ? '' : path
    return await InternalUtils.getRequest(
      `/parameter/${this.coreAddress}${sendPath}`,
      params,
    )
  }
  private async postRequestParameter(path: string, data: any): Promise<any> {
    return await InternalUtils.postRequest(
      `/parameter/${this.coreAddress}${path}`,
      data,
    )
  }
}

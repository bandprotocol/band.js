import BN from 'bn.js'

/**
 * alias
 */
export type Address = string
export type Time = string

/**
 * This is a interface of object that response from axios.
 */
export interface JsonResponse {
  result?: any
  message?: string
}

/**
 * This is a interface of object that response from axios.
 */
export interface GQLResponse {
  data?: any
}

export interface CommunityDetail {
  name: string
  symbol: string
  bonding: {
    collateralEquation: string[]
    liquiditySpread: string
  }
  params: {
    expirationTime: string
    minParticipationPct: string
    supportRequiredPct: string
  }
}

export interface SendToken {
  tokenAddress: Address
  to: Address
  value: string | BN
}

export interface BuySellType {
  amount: string | BN
  priceLimit: string | BN
}

export interface ParameterProposal {
  reasonHash: string
  keys: string[]
  values: (string | BN)[]
}

export interface CastVote {
  proposalId: number
  isAccepted: boolean
}

export interface TCRDetail {
  prefix: string
  decayFunction: string[]
  minDeposit: string
  applyStageLength: string
  dispensationPercentage: string
  commitTime: string
  revealTime: string
  minParticipationPct: string
  supportRequiredPct: string
}

export interface EntryWithStake {
  dataHash: string
  amount: string | BN
}

export interface ChallengeInit {
  entryHash: string
  reasonHash: string
  amount: string | BN
}

export interface CommitVote {
  challengeId: number
  commitHash: string
}

export interface RevealVote {
  challengeId: number
  voteKeep: boolean
  salt: string | BN
}

export interface TCDDetail {
  minProviderStake: string
  maxProviderCount: string
  ownerRevenuePct: string
  queryPrice: string
}

export interface DataSourceWithStake {
  dataSource: Address
  stake: string | BN
}

export interface WithdrawOwnership {
  dataSource: Address
  withdrawOwnership: string | BN
}

export interface TokenLockQuery {
  account: Address
  dataSource: Address
}

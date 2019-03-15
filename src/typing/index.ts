import BN from 'bn.js'

/**
 * alias
 */
export type Address = string
export type Equation = string
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

/**
 * This is interface of object for getOrderHistory function.
 */
export interface OrderHistory {
  user: Address
  orderType: string
  value: BN
  price: BN
  blockTime: Time
  txHash: string
}

/**
 * This is interface of object for getPriceHistory function.
 */
export interface PriceHistory {
  time: Time
  price: number
}

export interface BandInfo {
  address: Address
  price: number
  last24Hrs: number
}

export interface DappInfo {
  name: string
  symbol: string
  logo: string
  description: string
  website: string
  address: Address
  marketCap: number
  price: number
  last24Hrs: number
}

export interface Parameter {
  key: string
  value: BN
}

export interface Proposal {
  proposalId: number
  reasonHash: string
  proposer: Address
  proposedAt: Time
  pollEndTime: Time
  changes: Parameter[]
  yesVote: BN
  noVote: BN
  minParticipation: BN
  supportRequiredPct: BN
  totalVotingPower: BN
}

export interface VoteResult {
  proposalId: number
  yesVote: BN
  noVote: BN
}

export interface RewardDetail {
  rewardId: number
  rootHash: string
  totalReward: BN
  totalClaims: number
  totalPortion: BN
  imageLink: string
  detailLink: string
  header: string
  period: string
  claimed?: boolean
  amount?: BN
}

export interface Entry {
  dataHash: string
  proposer: Address
  deposit: BN
  proposedAt: Time
  listAt: Time
  status: string
  challengeId?: number
}

export interface Challenge {
  entryHash: string
  challenger: Address
  stake: BN
  challengeAt: Time
  commitEndTime: Time
  revealEndTime: Time
  challengeId: number
  minParticipation: BN
  supportRequiredPct: BN
  currentParticipation: BN
  totalVotingPower: BN
  currentYesVote: BN
  currentNoVote: BN
  voterReward?: BN
  leaderReward?: BN
  status: string
}

export interface Vote {
  voter: Address
  commitHash: string
  yesWeight: BN
  noWeight: BN
  onChainId: number
  claimed?: boolean
}

export interface EntryEvent {
  type: string
  timestamp: Time
  depositChanged: BN
  actor?: Address
  txHash?: string
}

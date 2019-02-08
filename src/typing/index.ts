import BN from 'bn.js'

/**
 * This is a interface of object that response from axios.
 */
export interface JsonResponse {
  result?: any
  message?: string
}

/**
 * This is interface of object for getOrderHistory function.
 */
export interface OrderHistory {
  user: Address
  order_type: string
  value: BN
  price: BN
  block_time: string
  tx_hash: string
}

/**
 * This is interface of object for getPriceHistory function.
 */
export interface PriceHistory {
  time: string
  price: number
}

/**
 * alias
 */
export type Address = string
export type Equation = string

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
  proposalID: number
  proposer: Address
  changes: Parameter[]
  yesVote: BN
  noVote: BN
}

export interface VoteResult {
  proposalID: number
  yesVote: BN
  noVote: BN
}

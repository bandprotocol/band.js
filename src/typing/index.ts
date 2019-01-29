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
  logo: string
  description: string
  website: string
  address: Address
  marketCap: BN
  price: BN
  last24Hrs: number
}

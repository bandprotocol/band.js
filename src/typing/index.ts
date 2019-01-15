import BN from 'bn.js'

export interface JsonResponse {
  result?: any
  message?: string
}

export interface OrderHistory {
  user: Address
  order_type: string
  value: BN
  price: BN
  block_time: string
}

export type Address = string

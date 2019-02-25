import Web3 from 'web3'

import axios from 'axios'
import { JsonResponse, Address } from '../typing'

export default class InternalUtils {
  static API = 'https://api.bandprotocol.com'

  static throw(m: string): never {
    throw new Error(m)
  }

  static async getRequest(path: string, params?: any): Promise<any> {
    const url = InternalUtils.API + path
    const response = await axios.get<JsonResponse>(url, { params })
    if (response.data.message !== undefined) {
      throw new Error(response.data.message)
    }
    return response.data.result
  }

  static async postRequest(path: string, data: any): Promise<any> {
    const url = InternalUtils.API + path
    const response = await axios.post<JsonResponse>(url, data)
    if (response.data.message !== undefined) {
      throw new Error(response.data.message)
    }
    return response.data.result
  }

  static async signMessage(web3: Web3, message: string, sender: Address) {
    if (typeof window !== 'undefined') {
      const metaMaskWeb3 = (window as any).web3
      return new Promise<string>((resolve, reject) => {
        metaMaskWeb3.personal.sign(message, sender, function(
          err: any,
          signed: any,
        ) {
          if (err !== null) reject(err)
          else resolve(signed)
        })
      })
    } else {
      return await web3.eth.sign(message, sender)
    }
  }
}

import Web3 from 'web3'
const Web3Legacy = require('web3-legacy')
import Qs from 'qs'
import axios from 'axios'
import { JsonResponse, Address } from '../typing'

export default class InternalUtils {
  static API = 'https://api.bandprotocol.com'

  static throw(m: string): never {
    throw new Error(m)
  }

  static async getRequest(path: string, params?: any): Promise<any> {
    const url = InternalUtils.API + path
    const listAxios = axios.create({
      paramsSerializer: params =>
        Qs.stringify(params, { arrayFormat: 'repeat' }),
    })
    const response = await listAxios.get<JsonResponse>(url, { params })
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
    try {
      const oldWeb3 = new Web3Legacy(web3.currentProvider)
      return new Promise<string>((resolve, reject) => {
        oldWeb3.personal.sign(message, sender, function(err: any, signed: any) {
          if (err !== null) reject(err)
          else resolve(signed)
        })
      })
    } catch {
      console.log('Cannot sign by legacy web3')
      return this.throw('Cannot sign a message')
    }
  }
}

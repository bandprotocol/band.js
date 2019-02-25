import axios from 'axios'
import { JsonResponse } from '../typing'

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
}

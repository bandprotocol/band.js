import Web3 from 'web3'
import axios from 'axios'
import { JsonResponse, GQLResponse, Address } from '../typing'

export default class InternalUtils {
  static API = 'https://bandapi-v2.herokuapp.com'
  static GRAPH_QL_API = 'https://graphql.bandprotocol.com/graphql'

  static throw(m: string): never {
    throw new Error(m)
  }

  static circularStringify(o: any): any {
    let cache: any = []
    JSON.stringify(o, function(_, value) {
      if (typeof value === 'object' && value !== null) {
        if (cache.indexOf(value) !== -1) {
          // Duplicate reference found
          try {
            // If this value does not reference a parent it can be deduped
            return JSON.parse(JSON.stringify(value))
          } catch (error) {
            // discard key if value cannot be deduped
            return
          }
        }
        // Store value in our collection
        cache.push(value)
      }
      return value
    })
    cache = null
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

  static async graphqlRequest(query: any): Promise<any> {
    const response = await axios.post<GQLResponse>(InternalUtils.GRAPH_QL_API, {
      query: query,
    })
    if (response.status !== 200) {
      throw new Error(response.statusText)
    }
    const { data } = response.data
    return data
  }

  static async signMessage(web3: Web3, message: string, sender: Address) {
    try {
      return await (web3.eth.personal.sign as any)(message, sender, '')
    } catch {
      console.log('Cannot sign by web3')
      return this.throw('Cannot sign a message')
    }
  }
}

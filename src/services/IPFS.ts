const _IPFS = require('ipfs-mini')
const ipfsClient = require('ipfs-http-client')
const bs58 = require('bs58')

import Utils from './Utils'

export default class IPFS {
  static ipfs = new _IPFS({
    host: 'ipfs.bandprotocol.com',
    port: 443,
    protocol: 'https',
  })

  static ipfsImg = ipfsClient({
    host: 'ipfs.bandprotocol.com',
    port: 443,
    protocol: 'https',
  })

  static async get(hexString: string) {
    const cid = IPFS.toIPFSHash(hexString)
    try {
      return await IPFS.ipfs.cat(cid)
    } catch (e) {
      console.log('error', cid)
      return null
    }
  }

  static async set(data: string) {
    const cid = await IPFS.ipfs.add(data)
    return IPFS.toHexString(cid)
  }

  static async uploadImageToIPFS(dataBytes: Uint8Array[]) {
    const [{ hash }] = await IPFS.ipfsImg.add(Buffer.from(dataBytes))
    return IPFS.toHexString(hash)
  }

  static toIPFSHash(hexString: string) {
    const hexStringNo0x = hexString.startsWith('0x')
      ? hexString.slice(2)
      : hexString
    const padedHexString = Utils.opad64(hexStringNo0x)
    return bs58.encode(Buffer.from('1220' + padedHexString, 'hex'))
  }

  static toHexString(ipfsHash: string) {
    const cidHex = bs58.decode(ipfsHash).toString('hex')
    if (cidHex.slice(0, 4) !== '1220')
      throw new Error(
        `Invalid IPFS hash format: '${ipfsHash}' Expect the first character to be '1220'`,
      )
    return '0x' + cidHex.slice(4)
  }
}

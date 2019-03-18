const _IPFS = require('nano-ipfs-store')
const bs58 = require('bs58')

export default class IPFS {
  static ipfs = _IPFS.at('https://ipfs.bandprotocol.com')

  static async get(dataHash: string) {
    const bytes = Buffer.from('01551220' + dataHash.slice(2), 'hex')
    const cid = 'z' + bs58.encode(bytes)
    return await this.ipfs.cat(cid)
  }

  static async set(data: string) {
    const cid = await this.ipfs.add(data)
    if (cid.slice(0, 1) !== 'z')
      throw new Error(
        `Invalid IPFS hash format: '${cid}' Expect the first character to be 'z'`,
      )
    const dataHash = bs58.decode(cid.slice(1)).toString('hex')
    if (dataHash.slice(0, 8) !== '01551220')
      throw new Error(
        `Invalid IPFS hash base58 encoded prefix: ${dataHash}. Expect first 8 characters to be '01551220'`,
      )
    return '0x' + dataHash.slice(8)
  }
}

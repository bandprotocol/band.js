const _IPFS = require('ipfs-mini')
const bs58 = require('bs58')

export default class IPFS {
  static ipfs = new _IPFS({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
  })

  static async get(dataHash: string) {
    const cid = bs58.encode(Buffer.from('1220' + dataHash.slice(2), 'hex'))
    let result = null
    try {
      result = await this.ipfs.cat(cid)
    } catch (e) {
      console.log('error')
      console.log(cid)
    }
    return result
  }

  static async set(data: string) {
    const cid = await this.ipfs.add(data)
    const cidHex = bs58.decode(cid).toString('hex')
    if (cidHex.slice(0, 4) !== '1220')
      throw new Error(
        `Invalid IPFS hash format: '${cid}' Expect the first character to be '1220'`,
      )
    return '0x' + cidHex.slice(4)
  }
}

import { Utils, IPFS } from '../src'
// import InternalUtils from '../src/services/InternalUtils'
import BN from 'bn.js'
;(async () => {
  console.log(Utils.fromBlockchainUnit(new BN('543210000056123456')))
  console.log(Utils.toBlockchainUnit(12.6).toString())
  console.log(Utils.toBlockchainUnit('1000.5').toString())
  console.log(Utils.toBlockchainUnit(0.78).toString())
  console.log(Utils.toBlockchainUnit('0.78').toString())
  console.log(Utils.fromBlockchainUnit(Utils.toBlockchainUnit('133423.43634')))

  // console.log(InternalUtils())
})()
;(async () => {
  const hash = await IPFS.set('hello world')
  console.log(hash)
  const data = await IPFS.get(hash)
  console.log(data)

  // const hs = 'QmbvoCzPfcxUM9Nz2go2X1nZTi81pM6U59gaaauyTZt588'
  // const hexString = IPFS.toHexString(hs)
  // const b10 = new BN(hs.slice(2), 16).toString()

  // console.log(hs, hexString, b10)
  // console.log(await IPFS.get(hexString))

  const b10 = new BN(
    '28378092536015966359919168076613151708871886773834252486137343913131688957044',
  )

  const img = IPFS.toIPFSHash(
    '0x' +
      new BN(
        '21595774567070935832119049071077098094547716696943650792627989096352901736981',
      ).toString(16),
  )

  console.log(img)
  console.log(await IPFS.get('0x' + b10.toString(16)))

  // console.log(InternalUtils())
})()

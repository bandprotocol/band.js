import { BandProtocolClient, Utils, IPFS } from '../src'
import InternalUtils from '../src/services/InternalUtils'
import config from './config-private'
import BN from 'bn.js'
import Web3 from 'web3'
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

const ipc = config.gethConnection + 'geth.ipc'
const provider = new Web3.providers.IpcProvider(ipc, require('net'))
BandProtocolClient.setAPI('https://api-wip.rinkeby.bandprotocol.com')
;(async () => {
  const bandClient = await BandProtocolClient.make({
    provider: provider,
  })
  if (bandClient !== undefined) {
    console.log(config)
    const web3: Web3 = new Web3(provider)
    // console.log(await bandClient.getNetworkType())
    const accountAddress = (await web3.eth.getAccounts())[0]
    console.log(accountAddress)
    console.log((await bandClient.getBalance()).toString())
    await web3.eth.personal.unlockAccount(
      accountAddress,
      config.accountPassword,
      500,
    )

    console.log(web3.currentProvider)

    console.log(await InternalUtils.signMessage(web3, 'bun', accountAddress))

    console.log(
      await web3.eth.sendTransaction({
        from: accountAddress,
        to: '0x85109F11A7E1385ee826FbF5dA97bB97dba0D76f',
        value: '1',
      }),
    )
  }
})()

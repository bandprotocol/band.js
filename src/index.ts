import Web3 from 'web3'
// import BN from 'bn.js'
import { BandProtocolClient } from './service'
import * as Seed from './Seed.json'
import * as config from './config-private.json'

const ipc = config.gethConnection + 'geth.ipc'
const provider = new Web3.providers.IpcProvider(ipc, require('net'))
  // ;(async () => {
  //   const bandProtocolClient = new BandProtocolClient()
  //   const bandClient = await bandProtocolClient.make({
  //     provider: provider,
  //   })
  //   const web3: Web3 = new Web3(provider)
  //   const accountAddress = (await web3.eth.getAccounts())[0]
  //   console.log(accountAddress)
  //   await web3.eth.personal.unlockAccount(
  //     accountAddress,
  //     config.accountPassword,
  //     100,
  //   )
  //   if (bandClient !== undefined) {
  //     const x = await bandClient.getNetworkType()
  //     console.log('Network: ', x)

  //     const y = await bandClient.getBalance()
  //     console.log('Owner Balance:', y)

  //     console.log(
  //       await bandClient.transfer(
  //         '0x180d1eC6665f9d636905F1869C1bc98DE2e8b121',
  //         new BN('50000000000000000000'),
  //       ),
  //     )

  //     console.log(
  //       await bandClient.at({
  //         coreAddress: '0xa377a6A2A4128004742a984e3F97E3cAd36181C1',
  //       }),
  //     )
  //   }
  // })()
;(async () => {
  const bandProtocolClient = new BandProtocolClient()
  const bandClient = await bandProtocolClient.make({
    provider: provider,
  })
  if (bandClient !== undefined) {
    const XCHClient = await bandClient.at({
      coreAddress: '0xa377a6A2A4128004742a984e3F97E3cAd36181C1',
    })
    console.log((await XCHClient.getBalance()).toString())
    console.log(await XCHClient.getBuyPrice('10000000000000000000'))
    console.log(await XCHClient.getSellPrice('10000000000000000000'))

    const web3: Web3 = new Web3(provider)
    const accountAddress = (await web3.eth.getAccounts())[0]
    console.log(accountAddress)
    await web3.eth.personal.unlockAccount(
      accountAddress,
      config.accountPassword,
      100,
    )

    // transfer XCH
    console.log(
      await XCHClient.transfer({
        to: Seed.Address.User1.publickey,
        value: '1000000000000000000',
      }),
    )
  }
})()

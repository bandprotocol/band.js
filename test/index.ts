import BandProtocolClient from '../src'
// import * as Seed from './Seed.json'
import config from './config-private'
import Web3 from 'web3'
import BN from 'bn.js'

const ipc = config.gethConnection + 'geth.ipc'
const provider = new Web3.providers.IpcProvider(ipc, require('net'))
  // ;(async () => {
  //   const bandClient = await BandProtocolClient.make({
  //     provider: provider,
  //   })
  //   const x = await bandClient.getNetworkType()
  //   console.log('Network: ', x)

  //   const y = await bandClient.getBalance()
  //   console.log('Owner Balance:', y)
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
  //       await bandClient.at('0xa377a6A2A4128004742a984e3F97E3cAd36181C1'),
  //     )
  //   }
  // })()
;(async () => {
  const bandClient = await BandProtocolClient.make({
    provider: provider,
  })
  if (bandClient !== undefined) {
    const XCHClient = await bandClient.at(
      '0xa377a6A2A4128004742a984e3F97E3cAd36181C1',
    )
    console.log((await XCHClient.getBalance()).toString())
    const buyAmount = '2000000000000000000'
    const buyPrice = await XCHClient.getBuyPrice(buyAmount)
    console.log('BuyPrice: ', buyPrice.toString())
    const sellAmount = new BN('1000000000000000000')
    const sellPrice = await XCHClient.getSellPrice(sellAmount)
    console.log('SellPrice: ', sellPrice.toString())

    const web3: Web3 = new Web3(provider)
    const accountAddress = (await web3.eth.getAccounts())[0]
    // console.log(accountAddress)
    await web3.eth.personal.unlockAccount(
      accountAddress,
      config.accountPassword,
      100,
    )

    // buy and sell XCH by BandToken
    // console.log(await XCHClient.buy(buyAmount, buyPrice))
    // console.log(await XCHClient.sell(sellAmount, sellPrice))

    // get order history
    console.log(
      await XCHClient.getOrderHistory({
        limit: 2,
        user: accountAddress,
        type: 'sell',
      }),
    )

    // transfer XCH
    // console.log(
    //   await XCHClient.transfer(
    //     Seed.Address.User1.publickey,
    //     '1000000000000000000',
    //   ),
    // )
  }
})()

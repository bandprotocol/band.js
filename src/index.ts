import Web3 from 'web3'
import { BandProtocolClient } from './service'
import * as Seed from './Seed.json'
import * as config from './config-private.json'

// const test = new Web3.providers.HttpProvider(
//   'https://rinkeby.infura.io/v3/7288751bb1014a7d8012057ca9303bed',
// )
const ipc = config.gethConnection + 'geth.ipc'
const provider = new Web3.providers.IpcProvider(ipc, require('net'))

const bandProtocolClient = new BandProtocolClient()
const bandClient = bandProtocolClient.make({
  provider: provider,
})
;(async () => {
  const x = await bandClient.getNetwork()
  console.log('Network: ', x)
})()
;(async () => {
  const x = await bandClient.getBalance()
  console.log('Owner Balance:', x)
})()
;(async () => {
  const XCHClient = await bandClient.at({
    coreAddress: '0xFc830F9d199739FBBD9e8fE91B1Cb968cd401084',
  })

  //   console.log(await XCHClient.getBalance())

  const { to, data } = await XCHClient.transfer({
    to: Seed.Address.User1.publickey,
    value: '10000000000000000000',
  })

  const web3: Web3 = new Web3(XCHClient.provider)
  const accountAddress = (await web3.eth.getAccounts())[0]
  console.log(accountAddress)
  await web3.eth.personal.unlockAccount(
    accountAddress,
    config.accountPassword,
    100,
  )

  console.log(await web3.eth.getBalance(accountAddress))

  console.log(
    await web3.eth.sendTransaction({
      from: accountAddress,
      to: to,
      //   value: '100',
      data: data,
      gas: '300000',
    }),
  )
})()

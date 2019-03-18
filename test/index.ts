import { BandProtocolClient, IPFS } from '../src'
// import * as Seed from './Seed.json'
import config from './config-private'
import Web3 from 'web3'

// import BN from 'bn.js'

const ipc = config.gethConnection + 'geth.ipc'
const provider = new Web3.providers.IpcProvider(ipc, require('net'))
BandProtocolClient.setAPI('https://api-wip.rinkeby.bandprotocol.com')
// Band Test
;(async () => {
  // const bandClient = await BandProtocolClient.make({
  //   provider: provider,
  // })
  // const x = await bandClient.getNetworkType()
  // console.log('Network: ', x)
  // const y = await bandClient.getBalance()
  // console.log('Owner Balance:', y)
  // const web3: Web3 = new Web3(provider)
  // const accountAddress = (await web3.eth.getAccounts())[0]
  // console.log(accountAddress)
  // await web3.eth.personal.unlockAccount(
  //   accountAddress,
  //   config.accountPassword,
  //   500,
  // )
  // if (bandClient !== undefined) {
  //   // send fee and feeless
  //   const tx = await bandClient.createTransferTransaction(
  //     '0xCE3E5C43bcF9BB937D50653BB830723fa477ED1E',
  //     new BN('1000000000000000000'), // 1 band
  //   )
  //   console.log('OK sendFeeles', await tx.sendFeeless())
  //   // console.log('OK send', await tx.send())
  // }
})()

console.log(
  '-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- BEGIN TEST BANDPROTOCOL CLIENT',
)
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
  }

  console.log('unlock')

  console.log('test ipfs')

  const logo = 'https://bandprotocol.com/static/media/logo.99f03541.svg'
  const description = `In this series of articles,
  we investigate the short selling in Bonding Curves and introduce our design to show how it works.
  It is worth mentioning that this work is originally inspired by our discussion with Paul Kohlhaas and Gonzalo Sainz Trápaga from Molecule,
  but the solution represents our internal research at Ocean Protocol.`

  const website = 'https://bandprotocol.com/'
  const author = 'Julia Scarlett Elizabeth Louis-Dreyfus'

  const values = [
    await IPFS.set(logo),
    await IPFS.set(description),
    await IPFS.set(website),
    await IPFS.set(author),
  ]

  console.log(values)

  for (const v of values) {
    console.log(await IPFS.get(v))
  }

  console.log(
    '-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- END TEST BANDPROTOCOL CLIENT',
  )

  // axios({
  //   url: 'https://api-wip.rinkeby.bandprotocol.com/graphql',
  //   method: 'post',
  //   data: {
  //     query: `{
  //       community(address: "0xf16fF31CfBfb48109f1E4ba332623A2e193E6083") {
  //         address
  //       }
  //     }`,
  //   },
  // }).then(result => {
  //   console.log(result.data)
  // })

  // console.log(response.data.result)
  // const x: any = await bandClient.deployCommunity(
  //   'HazardApp',
  //   'HZC',
  //   'https://i.imgur.com/FApqk3D.jpg',
  //   'D Day',
  //   'https://NewBandApp.com',
  //   'Umbrella Cooperation',
  //   'x * ((2* x / 2000000000000000000000000000000000000) ^ 2) * curve / 1000000000000',
  //   '0x8fAcfD1352EBc1F8Bb49d6C557609Ac35177d046',
  //   [
  //     'core:admin_contract',
  //     'core:reward_period',
  //     'core:reward_edit_period',
  //     'params:expiration_time',
  //     'params:support_required_pct',
  //     'params:min_participation_pct',
  //     'admin:min_deposit',
  //     'admin:apply_stage_length',
  //     'admin:support_required_pct',
  //     'admin:min_participation_pct',
  //     'admin:commit_time',
  //     'admin:reveal_time',
  //     'admin:reward_percentage',
  //   ],
  //   [
  //     '287919152008616205050887182337219248835982180233',
  //     '120',
  //     '120',
  //     '300',
  //     '70',
  //     '10',
  //     '100',
  //     '60',
  //     '50',
  //     '10',
  //     '60',
  //     '60',
  //     '50',
  //   ],
  //   '(x^2/2000000000000000000000000000000000000)^2',
  // )
  // console.log(x)
  // const XCHClient = await bandClient.at(
  //   '0xA624312D6b733855548bd3F4901D9b6aC465e0Dc',
  // )
  // console.log('token balance: ', (await XCHClient.getBalance()).toString())
  // await XCHClient.reportDetail({
  //   name: 'TestSimpleTCR',
  //   symbol: 'TST',
  //   logo: 'https://i.imgur.com/rYPVs3s.jpg',
  //   description: 'The Next Band Protocol dApp',
  //   website: 'https://NewBandApp.com',
  //   author: 'Band Protocol',
  //   priceEquation:
  //     'x * ((2* x / 2000000000000000000000000000000000000) ^ 2) * curve / 1000000000000',
  // })
  // // buy XCH by BandToken <----------------------
  // const buyAmount = '310000000000000000000' //310 token
  // const buyPrice = await XCHClient.getBuyPrice(buyAmount)
  // console.log('BuyPrice: ', buyPrice.toString())
  // const buyTx = await XCHClient.createBuyTransaction(buyAmount, buyPrice)
  // // console.log(await buyTx.sendFeeless())
  // console.log(await buyTx.send())
  // // sell XCH by BandToken <-----------------------
  // const sellAmount = new BN('500000000000000000') //0.5 token
  // const sellPrice = await XCHClient.getSellPrice(sellAmount)
  // console.log('SellPrice: ', sellPrice.toString())
  // const sellTx = await XCHClient.createSellTransaction(sellAmount, sellPrice)
  // console.log(await sellTx.sendFeeless())
  //----------------------------
  // // get balance
  // console.log('Owner Balance:', (await bandClient.getBalance()).toString())
  // // get order history
  // console.log(
  //   await XCHClient.getOrderHistory({
  //     limit: 2,
  //     user: accountAddress,
  //     type: 'buy',
  //   }),
  // )
  // /////////////Reward Test///////////////
  // transfer XCH
  // const transferTx = await XCHClient.createTransferTransaction(
  //   '0x7fD91BE45e01A3dfdA922A5B45d8CFA03207C072',
  //   '100000000000000000',
  // )
  // console.log(await transferTx.sendFeeless())
  // console.log(await transferTx.send())
  // console.log(await XCHClient.getRewards())
  // await XCHClient.createNewRewardTransaction(
  //   ['0x8208940DA3bDEfE1d3e4B5Ee5d4EeBf19AAe0468'],
  //   [50],
  //   'https://imgur.com/6C4DIsJ.png',
  //   'https://bandprotocol.com/',
  //   'Second Reward',
  //   '4-4-21',
  // )
  // await XCHClient.reportRewardDetail({
  //   imageLink: 'https://imgur.com/6C4DIsJ.png',
  //   detailLink: 'https://bandprotocol.com/',
  //   period: '1-1',
  //   header: 'Second reward',
  //   rewardId: 1,
  // })
  // const tx = await XCHClient.createClaimRewardTransaction(3)
  // console.log(await tx.send())
  /////////////////Params Test///////////////////
  // const parameterClient = XCHClient.parameter()
  // const paramTx = await parameterClient.createProposalTransaction(
  //   ['params:expiration_time', 'params:support_required_pct'],
  //   ['300', new BN('50')],
  // )
  // console.log(await paramTx.sendFeeless())
  // const tx2 = await parameterClient.createCastVoteTransaction(
  //   11,
  //   new BN('5000000000000000000'),
  //   '0',
  // )
  // console.log(await tx2.send())
  // console.log(await parameterClient.getParameters())
  // const proposals = await parameterClient.getProposals()
  // console.log(proposals)
  // console.log(proposals[0].changes)
  // console.log(await parameterClient.getVoteResultProposals())
  ////////tcr///////////
  // const tcrClient = XCHClient.tcr(
  //   '0xdfb96749910fcc1b3764e5d12200bb5c79115238',
  // )
  // const entryHash = '0x61316932311239512342319239293923929392392939293923931'
  // const reasonHash = '0x613169323112111192399239293923949392392939293923931'
  // const entryHash = '0x178237871247712488123818248812841823812388'
  // const entryTx = await tcrClient.createEntryTransaction(
  //   entryHash,
  //   '100000000000000000000',
  // )
  // console.log(await entryTx.sendFeeless())
  // const entryDepositTx = await tcrClient.createDepositTransaction(
  //   entryHash,
  //   '10000000000000000000',
  // )
  // console.log(await entryDepositTx.sendFeeless())
  // const entryWithDrawTx = await tcrClient.createWithdrawTransaction(
  //   entryHash,
  //   '5000000000000000000',
  // )
  // console.log(await entryWithDrawTx.send())
  // const entryChallengeTx = await tcrClient.createChallengeTransaction(
  //   entryHash,
  //   reasonHash,
  //   '100000000000000000000',
  // )
  // console.log(await entryChallengeTx.sendFeeless())
  // const entryCommitTx = await tcrClient.createCommitVoteTransaction(
  //   5,
  //   '10000000000000000000',
  //   '0',
  //   '555',
  // )
  // console.log(await entryCommitTx.send())
  // const entryRevealTx = await tcrClient.createRevealVoteTransaction(
  //   5,
  //   '10000000000000000000',
  //   '0',
  //   '555',
  // )
  // console.log(await entryRevealTx.send())
  // const entryExitTx = await tcrClient.createExitTransaction(entryHash)
  // console.log(await entryExitTx.send())
  //   console.log('ending', new BN(''))
  // }
})()
// ;(async () => {
//   const bandClient = await BandProtocolClient.make({
//     provider: provider,
//   })

//   const web3: Web3 = new Web3(provider)
//   const accountAddress = (await web3.eth.getAccounts())[0]
//   console.log(accountAddress)
//   await web3.eth.personal.unlockAccount(
//     accountAddress,
//     config.accountPassword,
//     500,
//   )
//   const tcr = await (await bandClient.at(
//     '0xeB7904c5D51B12136fBa246B4Dc7de28e46C622e',
//   )).tcr('0x27c378ae32099a788705a8138cc5338f4f30d94f')
//   console.log(web3.utils.soliditySha3('1', '1', '20'))
//   console.log(web3.utils.soliditySha3('1', '1', new BN('20')))
//   console.log(web3.utils.soliditySha3('1', '1', 20))
//   console.log(new BN('14', 'hex').toString())
//   console.log(web3.utils.soliditySha3('1', '1', new BN('0x14'.slice(2), 'hex')))
//   const hash = await tcr.createSalt(1)
//   console.log(hash.toString())
// console.log(await tcr.createSalt(1))
// console.log(
//   await tcr.getEntries({
//     entryHashes: [
//       '0x8077be181515783d95eaa4d8caebb93341dfc8636753c43700c4883579d8530a',
//       '0xddd978e9ec330dfe78ad93bc6b576cc3bc46676f89f37eebaf6db76b977195b0',
//     ],
//   }),
// )
// console.log((await tcr.getVotingPower(1)).toString())
// console.log(
//   Utils.fromBlockchainUnit(
//     await tcr.getMinDeposit(
//       '0xe2b82e6ec8c33f7ab6dbf28358b52ed3ed28e18b634c9cd36cb2494ac064407d',
//     ),
//   ),
// )

// await tcr.createCommitVoteTransaction(1, "1000", "0", "")
// console.log(await tcr.getChallenges({ challengeIds: [3, 11] }))
// console.log(await tcr.getVotes({ challengeIds: [1] }))
// console.log(await tcr.getEntryHistory({}))
// })()

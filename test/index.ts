import BandProtocolClient from '../src'
// import * as Seed from './Seed.json'
import config from './config-private'
import Web3 from 'web3'
import BN from 'bn.js'

const ipc = config.gethConnection + 'geth.ipc'
const provider = new Web3.providers.IpcProvider(ipc, require('net'))
BandProtocolClient.setAPI('https://api.rinkeby.bandprotocol.com')

// Band Test
;(async () => {
  const bandClient = await BandProtocolClient.make({
    provider: provider,
  })
  // const x = await bandClient.getNetworkType()
  // console.log('Network: ', x)
  // const y = await bandClient.getBalance()
  // console.log('Owner Balance:', y)
  const web3: Web3 = new Web3(provider)
  const accountAddress = (await web3.eth.getAccounts())[0]
  console.log(accountAddress)
  await web3.eth.personal.unlockAccount(
    accountAddress,
    config.accountPassword,
    500,
  )
  if (bandClient !== undefined) {
    // send fee and feeless
    const tx = await bandClient.createTransferTransaction(
      '0xCE3E5C43bcF9BB937D50653BB830723fa477ED1E',
      new BN('1000000000000000000'), // 1 band
    )
    console.log('OK sendFeeles', await tx.sendFeeless())
    // console.log('OK send', await tx.send())
  }
})()

// Community Test
;(async () => {
  const bandClient = await BandProtocolClient.make({
    provider: provider,
  })
  if (bandClient !== undefined) {
    // console.log(config)
    // const web3: Web3 = new Web3(provider)
    // // console.log(await bandClient.getNetworkType())
    // const accountAddress = (await web3.eth.getAccounts())[0]
    // console.log(accountAddress)
    // console.log((await bandClient.getBalance()).toString())
    // // console.log(await bandClient.getBand())
    // // console.log(await bandClient.getDApps())
    // await web3.eth.personal.unlockAccount(
    //   accountAddress,
    //   config.accountPassword,
    //   500,
    // )
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
    //   '0x41aAbBB1007E515F04E64e8495eBe06AeeFa0AB5',
    // )
    // console.log('token balance: ', (await XCHClient.getBalance()).toString())

    // await XCHClient.reportDetail({
    //   name: 'GodApp',
    //   symbol: 'GAC',
    //   logo: 'https://i.imgur.com/rYPVs3s.jpg',
    //   description: 'The Next Band Protocol dApp',
    //   website: 'https://NewBandApp.com',
    //   author: 'Band Protocol',
    //   priceEquation:
    //     'x * ((2* x / 2000000000000000000000000000000000000) ^ 2) * curve / 1000000000000',
    // })
    // // buy XCH by BandToken <----------------------
    // const buyAmount = '5000000000000000000' //5 token
    // const buyPrice = await XCHClient.getBuyPrice(buyAmount)
    // console.log('BuyPrice: ', buyPrice.toString())
    // const buyTx = await XCHClient.createBuyTransaction(buyAmount, buyPrice)
    // console.log(await buyTx.sendFeeless())
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
    //   rewardID: 1,
    // })
    // const tx = await XCHClient.createClaimRewardTransaction(3)
    // console.log(await tx.send())

    /////////////////Params Test///////////////////
    // const tx = await XCHClient.createProposalTransaction(
    //   ['params:reveal_time', 'params:support_required_pct'],
    //   ['50', new BN('60')],
    // )
    // console.log(await tx.send())
    // const tx2 = await XCHClient.createVoteProposalTransaction(
    //   3,
    //   new BN('100000000000000000'),
    //   '0',
    // )
    // console.log(await tx2.sendFeeless())
    // console.log(await XCHClient.getParameters())
    // const proposals = await XCHClient.getProposals()
    // console.log(proposals)
    // console.log(proposals[1].changes)
    // console.log(await XCHClient.getVoteResultProposals())
    console.log('ending', new BN(''))
  }
})()

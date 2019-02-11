import BandProtocolClient from '../src'
// import * as Seed from './Seed.json'
import config from './config-private'
import Web3 from 'web3'
// import BN from 'bn.js'

const ipc = config.gethConnection + 'geth.ipc'
const provider = new Web3.providers.IpcProvider(ipc, require('net'))

  // Band Test
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
  //     console.log(
  //       await bandClient.transfer(
  //         '0x180d1eC6665f9d636905F1869C1bc98DE2e8b121',
  //         new BN('1000000000000000000'),
  //       ),
  //     )
  //     console.log(
  //       await bandClient.at('0x1B3DEAe804474A4254cA78EBd07a854f98bD1110'),
  //     )
  //   }
  // })()

  // Community Test
;(async () => {
  const bandClient = await BandProtocolClient.make({
    provider: provider,
  })
  // console.log(bandClient)
  if (bandClient !== undefined) {
    // console.log(config)
    const web3: Web3 = new Web3(provider)
    // console.log(web3)
    // console.log(bandClient)
    // console.log(await bandClient.getNetworkType())
    const accountAddress = (await web3.eth.getAccounts())[1]
    console.log(accountAddress)
    // // console.log(await bandClient.getBand())
    // // console.log(await bandClient.getDApps())
    await web3.eth.personal.unlockAccount(
      accountAddress,
      config.accountPassword,
      500,
    )
    // const x: any = await bandClient.deployCommunity(
    //   'NewBandApp',
    //   'NBA',
    //   'https://NewBandApp.com/logo.png',
    //   'The Next Band Protocol dApp',
    //   'https://NewBandApp.com',
    //   'Band Protocol',
    //   'x * ((2* x / 2000000000000000000000000000000000000) ^ 2) * curve / 1000000000000',
    //   '0x83c8D85227639b2b2141e7a7eed2433C43839D11',
    //   [
    //     'core:admin_contract',
    //     'core:reward_period',
    //     'core:reward_edit_period',
    //     'params:commit_time',
    //     'params:reveal_time',
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
    //     '732867085902066557983618878559109073626010542366',
    //     '120',
    //     '120',
    //     '60',
    //     '60',
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
    const XCHClient = await bandClient.at(
      '0x17252C92FbF7a1Cc00fFf528B76021BD334aa802',
    )

    console.log('Before get rewards')

    console.log(await XCHClient.getRewards())

    // console.log(await XCHClient.createClaimRewardTransaction(1))
    // console.log(await XCHClient.getPriceHistory({}))
    // await XCHClient.reportDetail({
    //   name: 'NewBandApp',
    //   symbol: 'NBA',
    //   logo: 'https://NewBandApp.com/logo.png',
    //   description: 'The Next Band Protocol dApp',
    //   website: 'https://NewBandApp.com',
    //   author: 'Band Protocol',
    //   priceEquation:
    //     'x * ((2* x / 2000000000000000000000000000000000000) ^ 2) * curve / 1000000000000',
    // })
    // console.log((await XCHClient.getBalance()).toString())
    // // buy XCH by BandToken
    // const buyAmount = '10000000000000000000'
    // const buyPrice = await XCHClient.getBuyPrice(buyAmount)
    // console.log('BuyPrice: ', buyPrice.toString())
    // console.log(await XCHClient.buy(buyAmount, buyPrice))
    // // sell XCH by BandToken
    // const sellAmount = new BN('2000000000000000000')
    // const sellPrice = await XCHClient.getSellPrice(sellAmount)
    // console.log('SellPrice: ', sellPrice.toString())
    // console.log(await XCHClient.sell(sellAmount, sellPrice))
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
    // console.log(
    //   await XCHClient.transfer(
    //     '0x274Dc11053569DdD88BE25e3A71CfBc22944a3B0',
    //     '1000000000000000000',
    //   ),
    // )
    // // Add new reward to merkle and report new reward
    // const rewardID = await XCHClient.sendNewReward(
    //   [
    //     '0xCE3E5C43bcF9BB937D50653BB830723fa477ED1E',
    //     '0x8208940DA3bDEfE1d3e4B5Ee5d4EeBf19AAe0468',
    //   ],
    //   [40, 60],
    // )
    // console.log('rewardID', rewardID)
    // setTimeout(async () => {
    //   // ================HAVE TO WAITTING 2 MINUTE========================
    //   // const rewardID = 6
    //   console.log('reward', await XCHClient.getReward(rewardID))
    //   // claim reward
    //   console.log(await XCHClient.sendClaimReward(rewardID))
    //   // get Reward Detail
    //   const { totalReward, claimed } = await XCHClient.getRewardDetail(rewardID)
    //   console.log(`Number of claimed: ${claimed} Total Reward: ${totalReward}`)
    //   console.log('Owner Balance:', (await bandClient.getBalance()).toString())
    // }, 121000)

    /////////////////Params Test///////////////////
    //   const tx = await XCHClient.createProposalTransaction(
    //     ['params:reveal_time', 'params:support_required_pct'],
    //     ['80', new BN('50')],
    //   )
    //   tx.send().on('receipt', receipt => console.log('1', receipt))

    //   const tx2 = await XCHClient.createVoteProposalTransaction(
    //     7,
    //     new BN('20000000000000000000'),
    //     '0',
    //   )
    //   tx2.send().on('receipt', receipt => console.log('2', receipt))

    //   console.log(await XCHClient.getParameters())
    //   const proposals = await XCHClient.getProposals()
    //   console.log(proposals)
    //   console.log(proposals[2].changes)
    //   console.log(await XCHClient.getVoteResultProposals())
  }
})()

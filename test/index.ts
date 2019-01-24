import BandProtocolClient from '../src'
// import * as Seed from './Seed.json'
import config from './config-private'
import Web3 from 'web3'
// import BN from 'bn.js'

const ipc = config.gethConnection + 'geth.ipc'
const provider = new Web3.providers.IpcProvider(ipc, require('net'))
  // ;(async () => {
  //   const bandClient = await coBandProtocolClient.make({
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
    const web3: Web3 = new Web3(provider)
    bandClient.getNetworkType()
    const accountAddress = (await web3.eth.getAccounts())[0]
    console.log(accountAddress)
    await web3.eth.personal.unlockAccount(
      accountAddress,
      config.accountPassword,
      100,
    )
    console.log('Owner Balance:', (await bandClient.getBalance()).toString())
    const XCHClient = await bandClient.deployCommunity(
      'GodCoin',
      'GTA',
      'https://GodCoin.com/logo.png',
      'The GodCoin Band Protocol dApp',
      'https://GodCoin.com',
      '0x3c5BD7136310F764fCd14FC8fdE56D9243949485',
      [
        'core:admin_contract',
        'core:reward_period',
        'core:reward_edit_period',
        'params:commit_time',
        'params:reveal_time',
        'params:support_required_pct',
        'params:min_participation_pct',
        'admin:min_deposit',
        'admin:apply_stage_length',
        'admin:support_required_pct',
        'admin:min_participation_pct',
        'admin:commit_time',
        'admin:reveal_time',
        'admin:reward_percentage',
      ],
      [
        '427380525782779018038349510307084549229898376811',
        '120',
        '120',
        '60',
        '60',
        '70',
        '10',
        '100',
        '60',
        '50',
        '10',
        '60',
        '60',
        '50',
      ],
      '(x^2/2000000000000000000000000000000000000)^2',
    )
    console.log((await XCHClient.getBalance()).toString())
    // const buyAmount = '2000000000000000000'
    // const buyPrice = await XCHClient.getBuyPrice(buyAmount)
    // console.log('BuyPrice: ', buyPrice.toString())
    // const sellAmount = new BN('1000000000000000000')
    // const sellPrice = await XCHClient.getSellPrice(sellAmount)
    // console.log('SellPrice: ', sellPrice.toString())
    // buy and sell XCH by BandToken
    // console.log(await XCHClient.buy(buyAmount, buyPrice))
    // console.log(await XCHClient.sell(sellAmount, sellPrice))
    // get order history
    // console.log(
    //   await XCHClient.getOrderHistory({
    //     limit: 2,
    //     user: accountAddress,
    //     type: 'sell',
    //   }),
    // )
    // transfer XCH
    // console.log(
    //   await XCHClient.transfer(
    //     '0xCE3E5C43bcF9BB937D50653BB830723fa477ED1E',
    //     '1000000000000000000',
    //   ),
    // )

    // get order history
    // console.log(
    //   await XCHClient.getOrderHistory({
    //     limit: 2,
    //     user: accountAddress,
    //     type: 'sell',
    //   }),
    // )

    // Add new reward to merkle and report new reward
    const rewardID = await XCHClient.addNewReward(
      [
        '0xCE3E5C43bcF9BB937D50653BB830723fa477ED1E',
        '0x8208940DA3bDEfE1d3e4B5Ee5d4EeBf19AAe0468',
      ],
      [60, 40],
    )

    console.log('rewardID', rewardID)

    // have to wait 1 minute
    // User Action
    // check reward
    // const rewardID = 7
    console.log('reward', await XCHClient.getReward(rewardID))

    // claim reward
    console.log(await XCHClient.sendClaimReward(rewardID))

    // get Reward Detail
    const { totalReward, claimed } = await XCHClient.getRewardDetail(rewardID)
    console.log(`Number of claimed: ${claimed} Total Reward: ${totalReward}`)
  }
})()

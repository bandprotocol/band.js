import { Utils } from '../src'
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

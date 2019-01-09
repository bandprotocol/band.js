import Web3 from 'web3';
import BandProtocolClient from './service'

const test = new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/7288751bb1014a7d8012057ca9303bed');

const bandProtocolClient = new BandProtocolClient();
const bandClient = bandProtocolClient.make({
    provider: test
})

console.log(bandClient)

;(async () => {
    const x = await bandClient.getNetwork();
    console.log("Network: ", x)
})()

;(async () => {
    const x = await bandClient.getBalance();
    console.log("Owner Balance:", x)
})()

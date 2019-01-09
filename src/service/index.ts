import Web3 from 'web3'
import BN from 'bn.js';
import { Provider } from 'web3/providers';

type BandProtocolClientConstructorArgs = {
    provider?: Provider
}

export default class BandProtocolClient {
    // field
    provider?: Provider

    constructor(provider?: Provider) {
       this.provider = provider
    }

    make(args: BandProtocolClientConstructorArgs) {
        return new BandProtocolClient(args.provider)
    }

    async getNetwork(): Promise<string>{
        const web3 = new Web3(this.provider)
        const networkId = await web3.eth.net.getId()
        switch (networkId) {
            case 1:
                return 'Mainnet'
            case 3:
                return 'Ropsten'
            case 4:
                return 'Rinkeby'
            case 42:
                return 'Kovan' 
            default:
                return 'Unknown'
        }
    }
    
    async getBalance(): Promise<BN> {
        const web3 = new Web3(this.provider)
        return await web3.eth.getBalance('0xCE3E5C43bcF9BB937D50653BB830723fa477ED1E')
    }

}

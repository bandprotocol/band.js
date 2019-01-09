import Web3 from 'web3';
import BN from 'bn.js';

const web3: Web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/7288751bb1014a7d8012057ca9303bed'));

/**
 * This is a function with multiple arguments and a return value.
 * @param address  This is a string parameter.
 * 
 * @returns This is balance of address.
 *
 */
export const getBalance = async (address: string): Promise<BN> => {
    return (await web3.eth.getBalance(address));
};

;(async () => {
    console.log("Your balance:", (await getBalance('0xCE3E5C43bcF9BB937D50653BB830723fa477ED1E')).toString());
})()

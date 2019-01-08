import Web3 from 'web3';

const web3: Web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/7288751bb1014a7d8012057ca9303bed'));
const getBalance = async (address: string): Promise<string> => {
    return (await web3.eth.getBalance(address)).toString();
};

;(async () => {
    console.log("Your balance:", await getBalance('0xCE3E5C43bcF9BB937D50653BB830723fa477ED1E'));
})()

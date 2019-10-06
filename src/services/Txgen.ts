import Web3 from 'web3'
import { Address } from '../typing/index'
import BN from 'bn.js'

const web3 = new Web3('https://mainnet.infura.io')

// const { encodeFunctionSignature, encodeParameters } = web3.eth.abi

// const {} = web3.utils

export default class Txgen {
  static createTransactionData(
    funcSig: string,
    types: string[],
    parameters: any[],
  ): string {
    if (!funcSig.startsWith('0x')) {
      funcSig = web3.eth.abi.encodeFunctionSignature(funcSig)
    }
    return funcSig + web3.eth.abi.encodeParameters(types, parameters).slice(2)
  }

  static createTransferAndCall(
    to: Address,
    value: string | BN,
    sig: string,
    types: string[],
    parameters: any[],
  ): string {
    const callData = web3.eth.abi.encodeParameters(types, parameters)
    return Txgen.createTransactionData(
      'transferAndCall(address,uint256,bytes4,bytes)',
      ['address', 'uint256', 'bytes4', 'bytes'],
      [to, value, web3.eth.abi.encodeFunctionSignature(sig), callData],
    )
  }
}

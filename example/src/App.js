import React, { Component } from 'react'
import logo from './logo.svg'
import Web3 from 'web3'
import { BandProtocolClient, IPFS, Utils } from 'band.js'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import './App.css'

const DIVISOR = BigNumber(10).pow(18)

BN.prototype.pretty = function() {
  return BigNumber(this.toString())
    .div(DIVISOR)
    .toNumber()
    .toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    )
  }
}

window.BandProtocolClient = BandProtocolClient
window.BandUtil = Utils
window.IPFS = IPFS
window.BN = BN

window.bandInit = async () => {
  window.BandProtocolClient.setGraphQlAPI(
    'https://api.thegraph.com/subgraphs/name/taobun/bandprotocol-mainnet',
  )
  window.web4 = new Web3(window.ethereum)
  window.bandClient = await BandProtocolClient.make({
    provider: window.web4.currentProvider,
    bandAddress: '0xba11d00c5f74255f56a5e366f4f77f5a186d7f55',
  })

  window.communityClient = await window.bandClient.newTokenClient({
    tokenAddress: '0x33d3f653c9d86dc726337cf395fab39583a35988',
    curveAddress: '0xe5f32f9b531672889c72d2ba8be73f3a33c5c73e',
  })
  window.tcdClient = window.bandClient.newTcdClient(
    '0xd5d2b9e9bcd172d5fc8521afd2c98dd239f5b607',
  )
}

export default App

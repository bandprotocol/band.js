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
    'https://api.thegraph.com/subgraphs/name/taobun/bandprotocol-ropsten',
  )
  window.web4 = new Web3(window.ethereum)
  window.bandClient = await BandProtocolClient.make({
    provider: window.web4.currentProvider,
    bandAddress: '0x767c597367871521F3379B193EDB6B0af838D0d3',
  })

  window.communityClient = await window.bandClient.newTokenClient({
    tokenAddress: '0xb1277DEadd4428663773EE0F42E02b0483866186',
    curveAddress: '0x177d3Ec468a8ce1B6D98A8e5B64005c316b96100',
  })
  window.tcdClient = window.bandClient.newTcdClient(
    '0xd106616684F0744859Da868b6E67f79E6f42bec8',
  )
}

export default App

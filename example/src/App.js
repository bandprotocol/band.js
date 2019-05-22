import React, { Component } from 'react'
import logo from './logo.svg'
import Web3 from 'web3'
import { BandProtocolClient, IPFS } from 'band.js'
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
window.IPFS = IPFS
window.BN = BN

window.bandInit = async () => {
  window.BandProtocolClient.setAPI('https://api-wip.rinkeby.bandprotocol.com')
  window.web4 = new Web3(window.web3.currentProvider)
  window.bandClient = await BandProtocolClient.make({
    provider: window.web4.currentProvider,
  })
}

export default App

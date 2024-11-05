import React, { useState, useEffect } from 'react';
import MetaMaskLogin from './components/MetaMaskLogin';
import TradingInterface from './components/TradingInterface';
import WalletInteraction from './components/WalletInteraction';

import { Core } from '@walletconnect/core';
import { WalletKit } from '@reown/walletkit';


console.log("WALLET_CONNECT_PROJECT_ID: ", import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID);
const core = new Core({ 
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || ''  
})

const onConnect = async (uri: string) => {
  // call walletKit.core.pairing.pair( { uri: uri })
  // with the uri received from the dapp in order to emit the
  // `session_proposal` event
  const result = await walletKit.core.pairing.pair({ uri })
}

const walletKit = await WalletKit.init({
  core: core,
  metadata: {
    name: 'Lucia DEX',
    description: 'Lucia DEX with WalletConnect Integration',
    url: 'luciadex.com', //confirmed this is the domain name we own
    icons: []
  }
})

const App: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);

  const handleLogin = (connectedAccount: string) => {
    console.log(`Attempting to log in with account: ${connectedAccount}`);
    setAccount(connectedAccount);
  };

  useEffect(() => {
    console.log('Account state updated:', account);
  }, [account]);

  return (
    <div>
      <h1>WETH/DAI Swap</h1>
      
      {!account ? (
        <MetaMaskLogin onLogin={handleLogin} />
      ) : (
        <>
          <TradingInterface account={account} />
          <WalletInteraction account={account} />
        </>
      )}
    </div>
  );
};

export default App;

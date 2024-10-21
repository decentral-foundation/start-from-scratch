import React, { useState, useEffect } from 'react';
import MetaMaskLogin from './components/MetaMaskLogin';
import TradingInterface from './components/TradingInterface';

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
        <TradingInterface account={account} />
      )}
    </div>
  );
};

export default App;

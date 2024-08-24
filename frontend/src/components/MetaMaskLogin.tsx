import React, { useState } from 'react';
// import { ethers } from 'ethers';

const MetaMaskLogin: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (error) {
        console.error('User rejected the request.');
      }
    } else {
      console.error('MetaMask is not installed!');
    }
  };

  return (
    <div>
      <button onClick={connectMetaMask}>Connect MetaMask</button>
      {account && <p>Connected account: {account}</p>}
    </div>
  );
};

export default MetaMaskLogin;
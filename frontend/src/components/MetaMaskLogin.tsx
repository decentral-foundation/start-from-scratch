import React, { useState } from 'react';
// import { ethers } from 'ethers';

interface MetaMaskLoginProps {
  onLogin: (account: string) => void;
}


import { ethers } from 'ethers';

interface MetaMaskLoginProps {
  onLogin: (account: string) => void;
}

const MetaMaskLogin: React.FC<MetaMaskLoginProps> = ({ onLogin }) => {
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        console.log('Connected address:', address);
        onLogin(address);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    } else {
      console.error('MetaMask is not installed');
    }
  };

  return (
    <button onClick={connectWallet}>Connect with MetaMask</button>
  );
};


export default MetaMaskLogin;

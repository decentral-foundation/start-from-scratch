import React, { useState } from 'react';
import LuciaSDK from 'luciasdk-t3';

const my_api_key:string=process.env.REACT_APP_LUCIASDK_T3_API_KEY as string;

// import { ethers } from 'ethers';
LuciaSDK.init({
  clientId: "",
  baseURL: "https://staging.api.clickinsights.xyz/fk",
  api_key: my_api_key
});


const MetaMaskLogin: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        LuciaSDK.sendWalletInfo(accounts[0],11155111)
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
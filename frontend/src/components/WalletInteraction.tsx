import React, { useState } from 'react';
import { ethers } from 'ethers';

interface WalletInteractionProps {
  account: string;
}

const WalletInteraction: React.FC<WalletInteractionProps> = ({ account }) => {
  const [amount, setAmount] = useState<string>('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const simpleWalletAddress = '0x...'; // Replace with your actual contract address

  const depositEth = async () => {
    setTxHash(null);
    setError(null);

    if (!amount || isNaN(Number(amount))) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const amountWei = ethers.parseEther(amount);
      
      const tx = await signer.sendTransaction({
        to: simpleWalletAddress,
        value: amountWei
      });
      
      setTxHash(tx.hash);
      await tx.wait();
      console.log('ETH deposited successfully!');
    } catch (err) {
      console.error('Error depositing ETH:', err);
      setError('Failed to deposit ETH. Check console for details.');
    }
  };

  return (
    <div>
      <h2>Wallet Interaction</h2>
      <p>Connected Account: {account}</p>
      <input 
        type="text" 
        value={amount} 
        onChange={(e) => setAmount(e.target.value)} 
        placeholder="Amount in ETH"
      />
      <button onClick={depositEth}>Deposit ETH</button>
      {txHash && <p>Transaction Hash: {txHash}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default WalletInteraction;

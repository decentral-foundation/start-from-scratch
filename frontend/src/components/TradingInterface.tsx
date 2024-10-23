import React, { useState } from 'react';
import styles from './TradingInterface.module.css';

interface TradingInterfaceProps {
  account: string;
}

const TradingInterface: React.FC<TradingInterfaceProps> = ({ account }) => {
  const [amount, setAmount] = useState<string>('');

  const handleSwap = () => {
    console.log(`Swapping ${amount} WETH for DAI from account ${account}`);
  };

  const handleApprove = () => {
    console.log(`Approving ${amount} WETH for swap`);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Swap WETH for DAI</h2>
      <p className={styles.account}>Connected account: {account}</p>
      <div className={styles.inputContainer}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter WETH amount"
          className={styles.input}
        />
      </div>
      <div className={styles.buttonContainer}>
        <button onClick={handleApprove} className={styles.button}>
          Approve WETH
        </button>
        <button onClick={handleSwap} className={styles.button}>
          Swap to DAI
        </button>
      </div>
    </div>
  );
};

export default TradingInterface;

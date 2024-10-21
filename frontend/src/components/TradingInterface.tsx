import React, { useState } from 'react';



interface TradingInterfaceProps {
  account: string;
}

const TradingInterface: React.FC<TradingInterfaceProps> = ({ account }) => {
  const [amount, setAmount] = useState<string>('');

  const handleSwap = () => {
    // Implement swap logic here
    console.log(`Swapping ${amount} WETH for DAI from account ${account}`);
  };

  return (
    <div>
      <h2>Swap WETH for DAI</h2>
      <p>Connected account: {account}</p>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter WETH amount"
      />
      <button onClick={handleSwap}>Swap</button>
    </div>
  );
};



export default TradingInterface;

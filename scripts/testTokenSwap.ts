import { ethers } from 'ethers';
import { SEPOLIA_DAI, SEPOLIA_SIMPLE_WALLET } from '../deployed';

// ABI snippets we need for testing
const SIMPLE_WALLET_ABI = [
  "function depositTokens(address tokenAddress, uint256 amount) external",
  "function swapTokensForEth(address tokenAddress, uint256 tokenAmount, uint256 minEthAmount) external",
  "function getTokenBalance(address tokenAddress) external view returns (uint256)",
  "function getEtherBalance() external view returns (uint256)"
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)"
];

async function testTokenSwap() {
  // Connect to Sepolia using Infura
  const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  
  // Connect to contracts
  const simpleWallet = new ethers.Contract(
    SEPOLIA_SIMPLE_WALLET,
    SIMPLE_WALLET_ABI,
    wallet
  );
  
  const daiToken = new ethers.Contract(
    SEPOLIA_DAI,
    ERC20_ABI,
    wallet
  );

  try {
    // 1. Check initial balances
    console.log('Initial balances:');
    const initialTokenBalance = await simpleWallet.getTokenBalance(SEPOLIA_DAI);
    const initialEthBalance = await simpleWallet.getEtherBalance();
    console.log(`- DAI in wallet: ${ethers.formatEther(initialTokenBalance)}`);
    console.log(`- ETH in wallet: ${ethers.formatEther(initialEthBalance)}`);

    // 2. Approve tokens for deposit
    const depositAmount = ethers.parseEther("10"); // 10 DAI (for 0.1 ETH)
    console.log('\nApproving tokens...');
    const approveTx = await daiToken.approve(SEPOLIA_SIMPLE_WALLET, depositAmount);
    await approveTx.wait();

    // 3. Deposit tokens
    console.log('Depositing tokens...');
    const depositTx = await simpleWallet.depositTokens(SEPOLIA_DAI, depositAmount);
    await depositTx.wait();

    // 4. Perform swap (10 tokens = 0.1 ETH according to contract)
    console.log('\nPerforming swap...');
    const minEthAmount = ethers.parseEther("0.09"); // Expect at least 0.09 ETH
    const swapTx = await simpleWallet.swapTokensForEth(
      SEPOLIA_DAI,
      depositAmount,
      minEthAmount
    );
    await swapTx.wait();

    // 5. Check final balances
    console.log('\nFinal balances:');
    const finalTokenBalance = await simpleWallet.getTokenBalance(SEPOLIA_DAI);
    const finalEthBalance = await simpleWallet.getEtherBalance();
    console.log(`- DAI in wallet: ${ethers.formatEther(finalTokenBalance)}`);
    console.log(`- ETH in wallet: ${ethers.formatEther(finalEthBalance)}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
testTokenSwap()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

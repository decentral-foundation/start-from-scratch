const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  // Replace with your deployed SimpleWallet address
  const SIMPLE_WALLET_ADDRESS = "0xB9aDd4489f9F53fA6419B5142eAaa03639297C6d";

  // Amount of ETH to deposit and withdraw (0.1 ETH)
  const ethAmount = ethers.parseEther("0.1");
  const ethAmount2x = ethers.parseEther("0.2");

  // Get the SimpleWallet contract instance
  const SimpleWallet = await ethers.getContractFactory("SimpleWallet");
  const simpleWallet = await SimpleWallet.attach(SIMPLE_WALLET_ADDRESS);

  // Get the signer
  const [signer] = await ethers.getSigners();

  console.log("Interacting with SimpleWallet at:", SIMPLE_WALLET_ADDRESS);
  console.log("Using account:", await signer.getAddress());

  // Get initial balance
  let balance = await ethers.provider.getBalance(SIMPLE_WALLET_ADDRESS);
  console.log("Initial SimpleWallet ETH balance:", ethers.formatEther(balance));

  // Deposit ETH
  console.log("Depositing 0.1 ETH...");
  const depositTx = await signer.sendTransaction({
    to: SIMPLE_WALLET_ADDRESS,
    value: ethAmount
  });
  await depositTx.wait();
  console.log("ETH deposited. Transaction hash:", depositTx.hash);

  // Get balance after deposit
  balance = await ethers.provider.getBalance(SIMPLE_WALLET_ADDRESS);
  console.log("SimpleWallet ETH balance after deposit:", ethers.formatEther(balance));

  // Withdraw ETH
  console.log("Withdrawing 0.2 ETH...");
  const withdrawTx = await simpleWallet.connect(signer).withdrawEther(ethAmount2x);
  await withdrawTx.wait();
  console.log("ETH withdrawn. Transaction hash:", withdrawTx.hash);

  // Get final balance
  balance = await ethers.provider.getBalance(SIMPLE_WALLET_ADDRESS);
  console.log("Final SimpleWallet ETH balance:", ethers.formatEther(balance));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

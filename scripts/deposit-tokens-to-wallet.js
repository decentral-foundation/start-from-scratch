const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  // Replace these with your actual deployed contract addresses
  const SIMPLE_WALLET_ADDRESS = "0x258864712d9DF505a1226Dc62058B81209C05A7A";
  const WETH_ADDRESS = "0xf3bf1847cb177844F6E6EEEF8d66b8A5dc79b048";
  const DAI_ADDRESS = "0x556f0673655180732693541E81f76B2659faa66c";

  // Amount of tokens to deposit
  const wethAmount = ethers.parseEther("0.05");  // 0.05 WETH
  const daiAmount = ethers.parseUnits("50", 18); // 50 DAI

  // Get contract instances
  const SimpleWallet = await ethers.getContractFactory("SimpleWallet");
  const simpleWallet = await SimpleWallet.attach(SIMPLE_WALLET_ADDRESS);

  const WETH = await ethers.getContractFactory("WETH");
  const weth = await WETH.attach(WETH_ADDRESS);

  const DAI = await ethers.getContractFactory("DAI");
  const dai = await DAI.attach(DAI_ADDRESS);

  // Get the signer
  const [signer] = await ethers.getSigners();

  console.log("Depositing tokens to SimpleWallet at:", SIMPLE_WALLET_ADDRESS);
  console.log("Using account:", await signer.getAddress());

  // Deposit WETH
  console.log("Approving WETH...");
  let approveTx = await weth.approve(SIMPLE_WALLET_ADDRESS, wethAmount);
  await approveTx.wait();
  console.log("WETH approved. Transaction hash:", approveTx.hash);

  console.log("Depositing WETH...");
  let depositTx = await simpleWallet.depositTokens(WETH_ADDRESS, wethAmount);
  await depositTx.wait();
  console.log("WETH deposited. Transaction hash:", depositTx.hash);

  // Deposit DAI
  console.log("Approving DAI...");
  approveTx = await dai.approve(SIMPLE_WALLET_ADDRESS, daiAmount);
  await approveTx.wait();
  console.log("DAI approved. Transaction hash:", approveTx.hash);

  console.log("Depositing DAI...");
  depositTx = await simpleWallet.depositTokens(DAI_ADDRESS, daiAmount);
  await depositTx.wait();
  console.log("DAI deposited. Transaction hash:", depositTx.hash);

  // Check balances
  const wethBalance = await simpleWallet.getTokenBalance(WETH_ADDRESS);
  const daiBalance = await simpleWallet.getTokenBalance(DAI_ADDRESS);

  console.log("SimpleWallet WETH balance:", ethers.formatEther(wethBalance));
  console.log("SimpleWallet DAI balance:", ethers.formatUnits(daiBalance, 18));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

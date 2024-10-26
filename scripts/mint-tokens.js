const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  // Replace these with your actual deployed contract addresses
  // its hard coded for now, just import from deployed/index.js laterf
  const WETH_ADDRESS = "0xf3bf1847cb177844F6E6EEEF8d66b8A5dc79b048";
  const DAI_ADDRESS = "0x556f0673655180732693541E81f76B2659faa66c";

  const [owner] = await ethers.getSigners();

  console.log("Minting tokens with the account:", await owner.getAddress());

  // Get contract instances
  const WETH = await ethers.getContractFactory("WETH");
  const weth = WETH.attach(WETH_ADDRESS);

  const DAI = await ethers.getContractFactory("DAI");
  const dai = DAI.attach(DAI_ADDRESS);

  // Amount to mint (0.1 WETH and 100 DAI)
  const wethToMint = ethers.parseEther("0.1");
  const daiToMint = ethers.parseUnits("100", 18);

  // Mint WETH
  console.log("Minting 0.1 WETH...");
  const wethTx = await weth.deposit({ value: wethToMint });
  await wethTx.wait();
  console.log("WETH minted. Transaction hash:", wethTx.hash);

  // Mint DAI
  console.log("Minting 100 DAI...");
  const daiTx = await dai.faucet(await owner.getAddress(), daiToMint);
  await daiTx.wait();
  console.log("DAI minted. Transaction hash:", daiTx.hash);

  // Check balances
  const wethBalance = await weth.balanceOf(await owner.getAddress());
  const daiBalance = await dai.balanceOf(await owner.getAddress());

  console.log("WETH balance:", ethers.formatUnits(wethBalance, 18));
  console.log("DAI balance:", ethers.formatUnits(daiBalance, 18));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

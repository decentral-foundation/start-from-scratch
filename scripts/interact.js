const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();

  const wethAddress = "DEPLOYED_WETH_ADDRESS";
  const daiAddress = "DEPLOYED_DAI_ADDRESS";
  const dexAddress = "DEPLOYED_DEX_ADDRESS";

  const WETH = await hre.ethers.getContractFactory("WETH");
  const weth = WETH.attach(wethAddress);

  const DAI = await hre.ethers.getContractFactory("DAI");
  const dai = DAI.attach(daiAddress);

  const DEX = await hre.ethers.getContractFactory("DEX");
  const dex = DEX.attach(dexAddress);

  // Deposit ETH to get WETH
  await weth.deposit({ value: hre.ethers.utils.parseEther("1") });
  console.log("Deposited 1 ETH for WETH");

  // Get some DAI from the faucet
  await dai.faucet(signer.address, hre.ethers.utils.parseEther("1000"));
  console.log("Got 1000 DAI from faucet");

  // Approve DEX to spend WETH and DAI
  await weth.approve(dexAddress, hre.ethers.utils.parseEther("1"));
  await dai.approve(dexAddress, hre.ethers.utils.parseEther("1000"));
  console.log("Approved DEX to spend WETH and DAI");

  // Initialize liquidity in DEX
  await dex.init(hre.ethers.utils.parseEther("1"), hre.ethers.utils.parseEther("1000"));
  console.log("Initialized liquidity in DEX");

  // Perform a swap
  await dex.token0ToToken1(hre.ethers.utils.parseEther("0.1"));
  console.log("Swapped 0.1 WETH for DAI");

  // Check balances
  const wethBalance = await weth.balanceOf(signer.address);
  const daiBalance = await dai.balanceOf(signer.address);
  console.log("WETH balance:", hre.ethers.utils.formatEther(wethBalance));
  console.log("DAI balance:", hre.ethers.utils.formatEther(daiBalance));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

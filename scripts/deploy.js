const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const WETH = await hre.ethers.getContractFactory("WETH");
  const weth = await WETH.deploy();
  await weth.deployed();
  console.log("WETH deployed to:", weth.address);

  const DAI = await hre.ethers.getContractFactory("DAI");
  const dai = await DAI.deploy();
  await dai.deployed();
  console.log("DAI deployed to:", dai.address);

  const DEX = await hre.ethers.getContractFactory("DEX");
  const dex = await DEX.deploy(weth.address, dai.address);
  await dex.deployed();
  console.log("DEX deployed to:", dex.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

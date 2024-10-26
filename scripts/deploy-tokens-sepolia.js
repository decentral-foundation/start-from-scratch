const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.provider.getBalance(deployer.getAddress())).toString());

  // Deploy WETH
  const WETH = await ethers.getContractFactory("WETH");
  const weth = await WETH.deploy();
  await weth.waitForDeployment();
  console.log("WETH deployed to:", await weth.getAddress());

  // Deploy DAI
  const DAI = await ethers.getContractFactory("DAI");
  const dai = await DAI.deploy();
  await dai.waitForDeployment();
  console.log("DAI deployed to:", await dai.getAddress());

  console.log("Deployment completed");

  // Verify contracts on Etherscan
  console.log("Verifying contracts on Etherscan...");
  
  await hre.run("verify:verify", {
    address: await weth.getAddress(),
    constructorArguments: [],
  });

  await hre.run("verify:verify", {
    address: await dai.getAddress(),
    constructorArguments: [],
  });

  console.log("Verification completed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

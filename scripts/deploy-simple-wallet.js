const hre = require("hardhat");

async function main() {
  console.log("Deploying SimpleWallet contract...");

  // Get the contract factory
  const SimpleWallet = await hre.ethers.getContractFactory("SimpleWallet");

  // Deploy the contract
  const simpleWallet = await SimpleWallet.deploy();

  // Wait for the contract to be deployed
  await simpleWallet.waitForDeployment();

  console.log("SimpleWallet deployed to:", await simpleWallet.getAddress());
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

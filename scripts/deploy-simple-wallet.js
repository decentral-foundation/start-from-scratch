const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying SimpleWallet with the account:", await deployer.getAddress());

  console.log("Account balance:", (await ethers.provider.getBalance(deployer.getAddress())).toString());

  const SimpleWallet = await ethers.getContractFactory("SimpleWallet");
  const simpleWallet = await SimpleWallet.deploy();

  await simpleWallet.waitForDeployment();

  const simpleWalletAddress = await simpleWallet.getAddress();
  console.log("SimpleWallet deployed to:", simpleWalletAddress);

  // Verify the contract on Etherscan
  console.log("Waiting for Etherscan to index the contract...");
  await new Promise(resolve => setTimeout(resolve, 6000)); // Wait for 6 seconds

  try {
    await hre.run("verify:verify", {
      address: simpleWalletAddress,
      constructorArguments: [],
    });
    console.log("SimpleWallet verified on Etherscan");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

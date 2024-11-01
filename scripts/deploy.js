const hre = require("hardhat");

async function main() {
  // Get the contract factories
  const Balloons = await hre.ethers.getContractFactory("Balloons");
  const DEX = await hre.ethers.getContractFactory("DEX");

  // Deploy Balloons contract
  console.log("Deploying Balloons contract...");
  const balloons = await Balloons.deploy();
  await balloons.waitForDeployment();
  const balloonsAddress = await balloons.getAddress();
  console.log("Balloons deployed to:", balloonsAddress);

  // Deploy DEX contract with Balloons address
  console.log("Deploying DEX contract...");
  const dex = await DEX.deploy(balloonsAddress);
  await dex.waitForDeployment();
  const dexAddress = await dex.getAddress();
  console.log("DEX deployed to:", dexAddress);

  // For testing: approve DEX contract to spend Balloons
  console.log("Approving DEX contract to spend Balloons...");
  const approveTx = await balloons.approve(
    dexAddress, 
    hre.ethers.parseEther("1000")
  );
  await approveTx.wait();

  // Initialize the DEX with some tokens
  console.log("Initializing DEX with tokens...");
  const initTx = await dex.init(
    hre.ethers.parseEther("5"), 
    { value: hre.ethers.parseEther("5") }
  );
  await initTx.wait();

  console.log("Deployment and initialization completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

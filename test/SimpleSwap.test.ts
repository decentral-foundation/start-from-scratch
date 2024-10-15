const { expect } = require('chai');
const { ethers } = require('hardhat');
const { beforeEach } = require('mocha');

describe('SimpleSwap', function () {
  let swapRouter;
  let simpleSwap;
  let owner;
  let addr1;

  beforeEach(async function () {
    // Get the Signers
    [owner, addr1] = await ethers.getSigners();

    // Deploy a mock ISwapRouter contract
    const SwapRouterFactory = await ethers.getContractFactory('MockSwapRouter');
    console.log('SwapRouterFactory:', SwapRouterFactory);  // Should log a valid factory object

    swapRouter = await SwapRouterFactory.deploy();

    await swapRouter.waitForDeployment();
    await waitForOneSecond();
    console.log('MockSwapRouter deployed:', await swapRouter.getAddress());

    // Deploy the SimpleSwap contract
    const SimpleSwapFactory = await ethers.getContractFactory('SimpleSwap');
    simpleSwap = await SimpleSwapFactory.deploy(await swapRouter.getAddress());
    await simpleSwap.waitForDeployment();

    // Fund the test accounts with WETH and DAI (mock tokens)
    // You would typically use a mock ERC20 token for testing
  });

  it('Should swap WETH for DAI', async function () {
    // Arrange
    const amountIn = ethers.parseEther('1.0');
    // Assuming the mock router returns the same amount as output for simplicity
    const mockAmountOut = amountIn; 

    // Transfer WETH from addr1 to the SimpleSwap contract
    // For testing, you should use mock ERC20 tokens or a local testnet setup
    console.log("swapRouter in it: ",swapRouter);
    await swapRouter.connect(addr1).transfer(simpleSwap.address, amountIn);

    // Approve the SimpleSwap contract to spend WETH
    await swapRouter.connect(addr1).approve(simpleSwap.address, amountIn);

    // Act
    const tx = await simpleSwap.connect(addr1).swapWETHForDAI(amountIn);
    const receipt = await tx.wait();

    // Verify that the swap was successful
    expect(await simpleSwap.swapWETHForDAI(amountIn)).to.equal(mockAmountOut);

    // Further assertions could include verifying that the expected amount of DAI was received
  });
});

function waitForOneSecond() {
  return new Promise(resolve => setTimeout(resolve, 1000));
}

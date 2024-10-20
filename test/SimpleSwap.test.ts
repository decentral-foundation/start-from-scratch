const { expect } = require('chai');
const { ethers } = require('hardhat');
const { BigNumber } = require('ethers'); // Add this line
console.log("BigNumber: ",ethers.BigNumber);
// const { beforeEach } = require('mocha');

describe('SimpleSwap', function () {
  let swapRouter;
  let simpleSwap;
  let owner;
  let addr1;
  let weth;
  let dai; 

  const WETH_AMOUNT = ethers.parseEther("10"); // 10 WETH
  const DAI_MIN_OUTPUT = ethers.parseUnits("100", 18); // 100 DAI, assuming a reasonable price


  beforeEach(async function () {
    // Get the Signers
    [owner, addr1] = await ethers.getSigners();

    // Fund the test accounts with WETH and DAI (mock tokens)
    // Assume WETH and DAI contracts are already deployed in the testing environment
    const WETH = await ethers.getContractFactory("WETH");
    weth = await WETH.deploy();
    await weth.waitForDeployment();

    const DAI = await ethers.getContractFactory("DAI");
    dai = await DAI.deploy();
    await dai.waitForDeployment();


    // Mint WETH to owner for swapping
    await weth.deposit({ value: WETH_AMOUNT });



    // You would typically use a mock ERC20 token for testing
    // Deploy a mock ISwapRouter contract
    const SwapRouterFactory = await ethers.getContractFactory('MockSwapRouter');
    console.log('SwapRouterFactory:', SwapRouterFactory);  // Should log a valid factory object
    let wethAddr = await weth.getAddress();
    let daiAddr = await dai.getAddress();
    console.log("wethAddr, daiAddr: ",wethAddr, daiAddr)
    swapRouter = await SwapRouterFactory.deploy(wethAddr, daiAddr);
    await swapRouter.waitForDeployment();
    await waitForOneSecond();
    console.log('MockSwapRouter deployed:', await swapRouter.getAddress());

    // Deploy the SimpleSwap contract
    const SimpleSwapFactory = await ethers.getContractFactory('SimpleSwap');
    simpleSwap = await SimpleSwapFactory.deploy(await swapRouter.getAddress());
    await simpleSwap.waitForDeployment();
  });

  it('Should swap WETH for DAI', async function () {
    // Step 1: Approve the swap router to spend owner's WETH
    let addr = await swapRouter.getAddress();
    let tokenIn = await weth.getAddress();
    let tokenOut = await dai.getAddress();
    let ownerAddr = await owner.getAddress();
    console.log("addr: ",addr);
    await weth.approve(addr, WETH_AMOUNT);

    // Log initial WETH and DAI balances
    const wethBalanceInitial = await weth.balanceOf(owner.address);
    const daiBalanceInitial = await dai.balanceOf(owner.address);
    console.log("Initial WETH Balance: ", wethBalanceInitial);
    console.log("Initial DAI Balance: ", daiBalanceInitial);

    // Step 2: Define the swap parameters (Uniswap V3 exactInputSingle)
    const swapParams = {
      tokenIn,        // WETH
      tokenOut,        // DAI
      fee: 3000,                    // Uniswap pool fee (0.3%)
      recipient: ownerAddr,     // Where the DAI will go
      deadline: Math.floor(Date.now() / 1000) + 60 * 1, // 1 minutes from now
      amountIn: WETH_AMOUNT/2n,        // Amount of WETH to swap
      amountOutMinimum: DAI_MIN_OUTPUT, // Minimum amount of DAI to receive
      sqrtPriceLimitX96: 0          // No price limit
    };
    console.log('swapParams: ',swapParams);
    // Step 3: Perform the swap
    // give exact ether to spend, give you exact
    // swaps one token for another token says blockman codes
  
    const tx = await swapRouter.exactInputSingle(swapParams);
    await tx.wait(); // Ensure the transaction is mined
    // Step 4: Verify the DAI balance has increased for the owner
    const daiBalance = await dai.balanceOf(ownerAddr);
    console.log("DAI Balance after swap: ", daiBalance);
    console.log(typeof daiBalanceInitial)

    // Assertions
    expect(daiBalance).to.be.gte(daiBalance + DAI_MIN_OUTPUT); // Check that DAI balance increased
    expect(daiBalance).to.be.gte(DAI_MIN_OUTPUT); // DAI balance should be at least the minimum output
  });
});

function waitForOneSecond() {
  return new Promise(resolve => setTimeout(resolve, 1000));
}

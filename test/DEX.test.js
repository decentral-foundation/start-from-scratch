const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DEX", function () {
    let dex;
    let balloons;
    let owner;
    let user;
    const INITIAL_LIQUIDITY = ethers.parseEther("5");

    beforeEach(async function () {
        // Get signers
        [owner, user] = await ethers.getSigners();

        // Deploy Balloons contract
        const Balloons = await ethers.getContractFactory("Balloons");
        balloons = await Balloons.deploy();

        // Deploy DEX contract
        const DEX = await ethers.getContractFactory("DEX");
        dex = await DEX.deploy(await balloons.getAddress());

        // Approve DEX to spend owner's balloons
        await balloons.approve(await dex.getAddress(), ethers.parseEther("1000"));

        // Initialize DEX with liquidity
        await dex.init(INITIAL_LIQUIDITY, { value: INITIAL_LIQUIDITY });
    });

    describe("Initialization", function () {
        it("Should initialize with correct liquidity", async function () {
            expect(await dex.totalLiquidity()).to.equal(INITIAL_LIQUIDITY);
            expect(await dex.getLiquidity(owner.address)).to.equal(INITIAL_LIQUIDITY);
        });

        it("Should have correct token balance after init", async function () {
            expect(await balloons.balanceOf(await dex.getAddress())).to.equal(INITIAL_LIQUIDITY);
        });
    });

    describe("Swapping", function () {
        beforeEach(async function () {
            // Transfer some balloons to user for testing
            await balloons.transfer(user.address, ethers.parseEther("10"));
            await balloons.connect(user).approve(await dex.getAddress(), ethers.parseEther("10"));
        });

        it("Should allow ETH to token swap", async function () {
            const swapAmount = ethers.parseEther("1");
            const balanceBefore = await balloons.balanceOf(user.address);
            
            await dex.connect(user).ethToToken({ value: swapAmount });
            
            const balanceAfter = await balloons.balanceOf(user.address);
            expect(balanceAfter).to.be.gt(balanceBefore);
        });

        it("Should allow token to ETH swap", async function () {
            const swapAmount = ethers.parseEther("1");
            const ethBalanceBefore = await ethers.provider.getBalance(user.address);
            
            await dex.connect(user).tokenToEth(swapAmount);
            
            const ethBalanceAfter = await ethers.provider.getBalance(user.address);
            expect(ethBalanceAfter).to.be.gt(ethBalanceBefore);
        });
    });

    describe("Liquidity", function () {
        beforeEach(async function () {
            // Transfer some balloons to user for testing
            await balloons.transfer(user.address, ethers.parseEther("10"));
        });

        it("Should allow adding liquidity", async function () {
            const addAmount = ethers.parseEther("1");
            const liquidityBefore = await dex.getLiquidity(user.address);

            // Calculate required token amount based on the current ratio
            const ethReserve = await ethers.provider.getBalance(await dex.getAddress());
            const tokenReserve = await balloons.balanceOf(await dex.getAddress());
            const tokenAmount = (addAmount * tokenReserve / ethReserve) + BigInt(1);

            // Approve tokens first
            await balloons.connect(user).approve(await dex.getAddress(), tokenAmount);
            
            await dex.connect(user).deposit({ value: addAmount });
            
            const liquidityAfter = await dex.getLiquidity(user.address);
            expect(liquidityAfter).to.be.gt(liquidityBefore);
        });

        it("Should allow withdrawing liquidity", async function () {
            // First add liquidity
            const addAmount = ethers.parseEther("1");
            
            // Calculate required token amount
            const ethReserve = await ethers.provider.getBalance(await dex.getAddress());
            const tokenReserve = await balloons.balanceOf(await dex.getAddress());
            const tokenAmount = (addAmount * tokenReserve / ethReserve) + BigInt(1);

            // Approve tokens for deposit
            await balloons.connect(owner).approve(await dex.getAddress(), tokenAmount);
            
            // Add liquidity
            await dex.connect(owner).deposit({ value: addAmount });

            // Get liquidity amount
            const liquidityBefore = await dex.getLiquidity(owner.address);
            
            // Withdraw all liquidity
            await dex.withdraw(liquidityBefore);
            
            const liquidityAfter = await dex.getLiquidity(owner.address);
            expect(liquidityAfter).to.equal(0);
        });
    });

    describe("Price Calculations", function () {
        it("Should calculate correct token amount with 0.3% fee", async function () {
            // Test values with larger reserves
            const xInput = ethers.parseEther("1");         // 1 ETH input
            const xReserves = ethers.parseEther("1000");   // 1000 ETH in reserve
            const yReserves = ethers.parseEther("1000");   // 1000 tokens in reserve

            const output = await dex.price(xInput, xReserves, yReserves);

            // Calculate expected output manually
            const xInputWithFee = (xInput * BigInt(997));
            const numerator = xInputWithFee * yReserves;
            const denominator = (xReserves * BigInt(1000) + xInputWithFee);
            const expectedOutput = numerator / denominator;

            // Compare the actual and expected outputs
            expect(output).to.equal(expectedOutput);

            // Verify the output is reasonable 
            expect(output).to.be.lt(ethers.parseEther("1")); // Should be less than 1 token due to fee
            expect(output).to.be.gt(ethers.parseEther("0.995")); // Should be more than 0.995 tokens
        });

        it("Should maintain constant product formula after swap", async function () {
            const xInput = ethers.parseEther("1");     // 1 ETH input
            const xReserves = ethers.parseEther("10"); // 10 ETH in reserve
            const yReserves = ethers.parseEther("100"); // 100 tokens in reserve

            // Calculate constant product before swap
            const constantProduct = xReserves * yReserves;

            // Get output amount
            const yOutput = await dex.price(xInput, xReserves, yReserves);

            // Calculate new reserves after swap (including 0.3% fee)
            const newXReserves = xReserves + (xInput * BigInt(997) / BigInt(1000));
            const newYReserves = yReserves - yOutput;

            // Calculate new constant product
            const newConstantProduct = newXReserves * newYReserves;

            // The new constant product should be greater than or equal to the original
            // due to the 0.3% fee
            expect(newConstantProduct).to.be.gte(constantProduct);
        });

        it("Should return 0 for 0 input", async function () {
            const xReserves = ethers.parseEther("10");
            const yReserves = ethers.parseEther("100");

            const output = await dex.price(0, xReserves, yReserves);
            expect(output).to.equal(0);
        });

        it("Should handle large and small numbers correctly", async function () {
            // Test with very small input
            const smallInput = BigInt(1000); // 0.000000000000001 ETH
            const output1 = await dex.price(
                smallInput,
                ethers.parseEther("10"),
                ethers.parseEther("100")
            );
            expect(output1).to.be.gt(0);

            // Test with very large input
            const largeInput = ethers.parseEther("1000000");
            const output2 = await dex.price(
                largeInput,
                ethers.parseEther("10"),
                ethers.parseEther("100")
            );
            expect(output2).to.be.lt(ethers.parseEther("100")); // Cannot exceed reserve
        });
    });
}); 
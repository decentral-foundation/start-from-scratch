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
}); 
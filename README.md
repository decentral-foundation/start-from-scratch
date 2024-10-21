# How to set up on a new developer environment

## Install Libraries
* `npm i `
OR
* `npm install @uniswap/v3-periphery`



## Followup steps

* First you'll run git clone 
* Then you'll need to run `npm install --save-dev hardhat`
  - Check Hardhat configuration: Ensure the project has a hardhat.config.js or hardhat.config.ts file, which is the standard configuration file for Hardhat projects. If it’s missing, you may need to initialize Hardhat:
* Then you'll need to run on localhost `npx hardhat node`
  - After this the goal is to get `npx hardhat test` working. If its not running the test, you'll need to specify the exact directory location. `npx hardhat test ./test/SimpleSwap.test.ts --network localhost`
* Then you'll get HH19 errors, unless you specify Chai to be exactly version `4.3.7` because otherwise its treated as a module


## Deploying to sepolia

Deploy the contracts:  

`npx hardhat run scripts/deploy.js --network sepolia`

Run the interaction script (you may have to fill in the addresses):

`npx hardhat run scripts/interact.js --network sepolia`

### This script demonstrates how to:
 
* Deposit ETH to get WETH
* Get DAI from the faucet
* Approve the DEX to spend tokens
* Initialize liquidity in the DEX
* Perform a swap
* Check token balances

## Deploying to a new network for the first time

```zsh
npx hardhat verify --network sepolia <WETH_ADDRESS>
npx hardhat verify --network sepolia <DAI_ADDRESS>
npx hardhat verify --network sepolia <DEX_ADDRESS> <WETH_ADDRESS> <DAI_ADDRESS>
```

## Key articles

First understand this

1. https://docs.ethers.org/v6/migrating/#migrate-contracts
2. See the most reecent commits that migrated over depreciated methods

## How to build and host the frontend for staing and production

First you may encounter errors when running `npm run build` even if `npm run dev` works. 

* comment out unused variables like `import { ethers } from 'ethers';`
* Error TS2339: Property 'ethereum' does not exist on type 'Window & typeof globalThis'
  - The `ethereum` property on `window` is not defined in the TypeScript type definitions by default. You need to extend the global `Window` interface to include `ethereum`.
  - Fix: Add a declaration for `window.ethereum`. You can create a new file for this or add it at the top of your MetaMaskLogin.tsx file.


  Can add file `global.d.ts` in your `src` folder

  ```tsx
  // src/global.d.ts
interface Window {
  ethereum?: any;
}
```

Read this page: https://gist.github.com/lingqingmeng/814026293c3313e2eb2c8e1b52b8d6d0


# Deploying to production

Moving away from `http-server` and into 

You'll need an **ecosystem.config.js** file for pm2




# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```zsh
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```


# About the tests and mocks

Let's say you write a simple mock

```solidity
// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.7.6;

import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';

contract MockSwapRouter is ISwapRouter {
    function exactInputSingle(ExactInputSingleParams calldata params) external override returns (uint256 amountOut) {
        // For simplicity, just return the input amount
        return params.amountIn;
    }
}

```

It looks like there are several issues with the mock contract implementation for `MockSwapRouter`. Here’s how to address them:

### Issues to Address

1. **State Mutability Mismatch**: The function `exactInputSingle` in the mock contract should be marked as `payable` to match the interface.
2. **Missing Implementations**: All required functions from the `ISwapRouter` interface need to be implemented.
3. **ABI Encoder Version**: Ensure that `pragma abicoder v2;` is used, as the interface uses ABI Encoder V2.

### Updated Mock Contract

To address these issues, update your mock contract as follows:

1. **Implement All Required Functions**: Provide minimal implementations for all functions declared in the `ISwapRouter` interface.
2. **Match Function Signatures**: Ensure that all overridden functions match the state mutability of the original functions.
3. **Use ABI Encoder V2**: Add `pragma abicoder v2;` at the top of the contract.

Here’s an updated version of the `MockSwapRouter.sol`:

```solidity
// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.7.6;
pragma abicoder v2;

import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';

contract MockSwapRouter is ISwapRouter {
    // Implementations of the ISwapRouter functions
    function exactInput(ExactInputParams calldata params) external payable override returns (uint256 amountOut) {
        // Simple mock: return the input amount
        return params.amountIn;
    }

    function exactInputSingle(ExactInputSingleParams calldata params) external payable override returns (uint256 amountOut) {
        // Simple mock: return the input amount
        return params.amountIn;
    }

    function exactOutput(ExactOutputParams calldata params) external payable override returns (uint256 amountIn) {
        // Simple mock: return the input amount
        return params.amountOut;
    }

    function exactOutputSingle(ExactOutputSingleParams calldata params) external payable override returns (uint256 amountIn) {
        // Simple mock: return the input amount
        return params.amountOut;
    }

    // Mock function to simulate the callback
    function uniswapV3SwapCallback(int256 amount0Delta, int256 amount1Delta, bytes calldata data) external override {
        // No-op
    }
}
```

### Explanation

1. **State Mutability**:
   - Mark functions as `payable` to match the `ISwapRouter` interface.

2. **Implement All Functions**:
   - Provide basic implementations that return input values for simplicity. These mock implementations help you test the interaction with `SimpleSwap` without needing a fully functional Uniswap V3 router.

3. **ABI Encoder V2**:
   - Add `pragma abicoder v2;` to ensure compatibility with the `ISwapRouter` interface which uses ABI Encoder V2.

### Recompile Your Contracts

After updating the mock contract, recompile your contracts with Hardhat:

```bash
npx hardhat compile
```

This should resolve the compilation errors. If there are any further issues, please let me know!

### Backlinks

* https://docs.uniswap.org/contracts/v3/guides/local-environment
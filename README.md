# How to build and host the frontend for staing and production

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

```shell
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

## Pm2 Installation

The provided PM2 configuration is designed to serve a Vite-built TypeScript application using the `serve` package. Here's a breakdown of what each part of the configuration does and why it is necessary:

### Configuration Breakdown

```javascript
module.exports = {
  apps: [
    {
      name: `vite-app`,
      script: "serve",
      env: {
        PM2_SERVE_PATH: "./dist",
        PM2_SERVE_PORT: 5173,
        PM2_SERVE_SPA: "true",
        NODE_ENV: 'production',
      },
    },
  ],
};
```

1. **`name: 'vite-app'`:**
   - **Purpose**: This sets the name of the PM2 process. The process will be listed under this name when you use PM2 commands like `pm2 list` or `pm2 logs vite-app`.
   - **Reason**: It helps in identifying and managing the process, especially when running multiple applications with PM2.

2. **`script: 'serve'`:**
   - **Purpose**: Specifies the command to run. In this case, it’s using the `serve` package to serve the built files.
   - **Reason**: Since Vite doesn't have a built-in way to serve the production build (which is stored in the `dist` folder), the `serve` package is used to provide a static server for these files.

3. **`env` Block:**
   - **Purpose**: The `env` block sets environment variables that configure how the `serve` command operates within PM2.
   - **Reason**: These environment variables are needed to correctly serve the Vite build with PM2.

   - **`PM2_SERVE_PATH: './dist'`**:
     - **Purpose**: Specifies the path to the directory that should be served. In this case, `./dist` is the directory where the Vite production build outputs the compiled files.
     - **Reason**: Without specifying this, PM2 wouldn't know which directory to serve, so this is essential for the app to be accessible.

   - **`PM2_SERVE_PORT: 5173`**:
     - **Purpose**: Sets the port on which the app will be served. Port `5173` is often used as the default development port for Vite, but you can change this to any available port.
     - **Reason**: Specifying the port ensures that the app is accessible at a known address (e.g., `http://localhost:5173`).

   - **`PM2_SERVE_SPA: 'true'`**:
     - **Purpose**: Enables Single Page Application (SPA) mode. When set to `true`, all 404 routes will be redirected to `index.html`.
     - **Reason**: In SPAs, routing is typically handled client-side, and this setting ensures that any route not recognized by the server is passed to the front-end router. This prevents 404 errors when users try to access routes directly.

   - **`NODE_ENV: 'production'`**:
     - **Purpose**: Sets the environment to `production`. This is a standard environment variable that many tools use to optimize for production.
     - **Reason**: Ensures that any production-specific optimizations are enabled, and the application runs in a mode optimized for performance and security.

### Why This Configuration Is Needed for Vite TypeScript Dist Builds

- **Serving the Build**: Vite’s production build outputs static files into a `dist` directory. Unlike some frameworks, Vite doesn’t provide a built-in server for serving these files, so you need an external tool like `serve` to host them.
- **SPA Handling**: Since Vite apps are often SPAs, the `PM2_SERVE_SPA` setting ensures that client-side routing works correctly, preventing issues where users see a 404 error when they refresh or directly access a route.
- **Production Environment**: The `NODE_ENV: 'production'` setting ensures that the application and any libraries it uses are running in a mode optimized for production.

This PM2 configuration automates the process of serving the Vite production build, handles SPA routing, and ensures the app is optimized for production use.

### Backlinks

* https://docs.uniswap.org/contracts/v3/guides/local-environment


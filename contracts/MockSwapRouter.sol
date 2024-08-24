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

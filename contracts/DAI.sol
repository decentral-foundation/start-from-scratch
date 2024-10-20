// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DAI is ERC20 {
    constructor() ERC20("Dai Stablecoin", "DAI") {
        // Optionally, mint some initial DAI supply for testing purposes
        _mint(msg.sender, 1000000 * 10 ** decimals()); // Mint 1,000,000 DAI to the deployer
    }

    // Mint new DAI tokens (only for testing purposes)
    function faucet(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WETH is ERC20 {
    constructor() ERC20("Wrapped Ether", "WETH") {}

    // Deposit ETH to get WETH
    function deposit() external payable {
        _mint(msg.sender, msg.value);
    }

    // Withdraw WETH to get ETH back
    function withdraw(uint256 amount) external {
        require(balanceOf(msg.sender) >= amount, "Insufficient WETH balance");
        _burn(msg.sender, amount);
        payable(msg.sender).transfer(amount);
    }

    // Fallback function to accept ETH transfers
    receive() external payable {
        _mint(msg.sender, msg.value); // Mint WETH directly in the receive function
    }
}

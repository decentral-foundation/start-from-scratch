// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

contract SimpleWallet {
    using SafeERC20 for IERC20;

    address public owner;
    mapping(address => uint256) public tokenBalances;

    event EtherReceived(address indexed sender, uint256 amount);
    event TokensReceived(address indexed sender, address indexed token, uint256 amount);
    event EtherWithdrawn(address indexed recipient, uint256 amount);
    event TokensWithdrawn(address indexed recipient, address indexed token, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    // Function to receive Ether
    receive() external payable {
        emit EtherReceived(msg.sender, msg.value);
    }

    // Function to receive tokens
    function depositTokens(address tokenAddress, uint256 amount) external {
        IERC20 token = IERC20(tokenAddress);
        token.safeTransferFrom(msg.sender, address(this), amount);
        tokenBalances[tokenAddress] += amount;
        emit TokensReceived(msg.sender, tokenAddress, amount);
    }

    // Function to withdraw Ether
    function withdrawEther(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient Ether balance");
        payable(owner).transfer(amount);
        emit EtherWithdrawn(owner, amount);
    }

    // Function to withdraw tokens
    function withdrawTokens(address tokenAddress, uint256 amount) external onlyOwner {
        require(tokenBalances[tokenAddress] >= amount, "Insufficient token balance");
        IERC20 token = IERC20(tokenAddress);
        tokenBalances[tokenAddress] -= amount;
        token.safeTransfer(owner, amount);
        emit TokensWithdrawn(owner, tokenAddress, amount);
    }

    // Function to check Ether balance
    function getEtherBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Function to check token balance
    function getTokenBalance(address tokenAddress) external view returns (uint256) {
        return tokenBalances[tokenAddress];
    }
}

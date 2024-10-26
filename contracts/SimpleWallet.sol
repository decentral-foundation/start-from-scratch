// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract SimpleWallet {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    address public owner;
    mapping(address => uint256) public tokenBalances;

    event EtherReceived(address indexed sender, uint256 amount);
    event EtherDeposited(address indexed sender, uint256 amount);
    event TokensReceived(address indexed sender, address indexed token, uint256 amount);
    event EtherWithdrawn(address indexed recipient, uint256 amount);
    event TokensWithdrawn(address indexed recipient, address indexed token, uint256 amount);
    event TokensSwappedForEth(address indexed token, uint256 tokenAmount, uint256 ethAmount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    receive() external payable {
        emit EtherReceived(msg.sender, msg.value);
    }

    // New function for explicit Ether deposits
    function depositEther() external payable {
        emit EtherDeposited(msg.sender, msg.value);
    }

    function depositTokens(address tokenAddress, uint256 amount) external {
        IERC20 token = IERC20(tokenAddress);
        token.safeTransferFrom(msg.sender, address(this), amount);
        tokenBalances[tokenAddress] = tokenBalances[tokenAddress].add(amount);
        emit TokensReceived(msg.sender, tokenAddress, amount);
    }

    function withdrawEther(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient Ether balance");
        payable(owner).transfer(amount);
        emit EtherWithdrawn(owner, amount);
    }

    function withdrawTokens(address tokenAddress, uint256 amount) external onlyOwner {
        require(tokenBalances[tokenAddress] >= amount, "Insufficient token balance");
        IERC20 token = IERC20(tokenAddress);
        tokenBalances[tokenAddress] = tokenBalances[tokenAddress].sub(amount);
        token.safeTransfer(owner, amount);
        emit TokensWithdrawn(owner, tokenAddress, amount);
    }

    function getEtherBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getTokenBalance(address tokenAddress) external view returns (uint256) {
        return tokenBalances[tokenAddress];
    }

    function swapTokensForEth(address tokenAddress, uint256 tokenAmount, uint256 minEthAmount) external onlyOwner {
        require(tokenBalances[tokenAddress] >= tokenAmount, "Insufficient token balance");
        require(address(this).balance >= minEthAmount, "Insufficient ETH in contract for swap");

        // Hardcoded exchange rate: 100 tokens = 1 ETH
        uint256 ethAmount = tokenAmount.div(100);
        require(ethAmount >= minEthAmount, "Swap doesn't meet minimum ETH amount");

        IERC20 token = IERC20(tokenAddress);
        tokenBalances[tokenAddress] = tokenBalances[tokenAddress].sub(tokenAmount);
        token.safeTransfer(owner, tokenAmount);
        payable(owner).transfer(ethAmount);

        emit TokensSwappedForEth(tokenAddress, tokenAmount, ethAmount);
    }
}

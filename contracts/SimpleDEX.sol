// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract SimpleDEX {
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
    event EthSwappedForTokens(address indexed token, uint256 ethAmount, uint256 tokenAmount);

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

    /**
     * 1. starting state contract has both ETH and DAI in reserves
     * 2. person has DAI and wants to buy ETH
     *   a. Person sends contract DAI
     *   b. Person gets back some ETH
     * 3. The contract DAI balance increases, ETH balance decreases
     */
    function swapTokensForEth(address tokenAddress, uint256 tokenAmount, uint256 minEthAmount) external onlyOwner {
        require(tokenBalances[tokenAddress] >= tokenAmount, "Insufficient token balance");
        require(address(this).balance >= minEthAmount, "Insufficient ETH in contract for swap");
        // hard coded exchange rate: 100 tokens = 1 ETH
        uint256 ethAmount = tokenAmount.div(100);
        uint256 tAmount = tokenAmount;
        IERC20 token = IERC20(tokenAddress);
        token.safeTransferFrom(msg.sender, address(this),tokenAmount); 
        tokenBalances[tokenAddress] = tokenBalances[tokenAddress].add(tokenAmount);
        emit TokensReceived(msg.sender, tokenAddress, tAmount);
        payable(owner).transfer(ethAmount);
        emit TokensSwappedForEth(tokenAddress, tAmount, ethAmount);
    }

    function swapEthForTokens(address tokenAddress, uint256 minTokenAmount) external payable onlyOwner {
        require(msg.value > 0, "Must send ETH to swap");
        
        // Hardcoded exchange rate: 1 ETH = 100 tokens
        uint256 tokenAmount = msg.value.mul(100);
        require(tokenAmount >= minTokenAmount, "Swap doesn't meet minimum token amount");
        
        IERC20 token = IERC20(tokenAddress);
        
    }

}
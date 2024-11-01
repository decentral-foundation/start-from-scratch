pragma solidity =0.7.6;
pragma abicoder v2;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Balloons is ERC20 {
    constructor() public ERC20("Balloons", "BAL") {
        _mint(msg.sender, 1000 ether); // mints 1000 balloons!
    }
}
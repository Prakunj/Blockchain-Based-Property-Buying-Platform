
// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./FlashLoan.sol";

contract FlashLoanReceiver {
    FlashLoan private pool;
    address private owner;

    event LoanReceived(address token, uint256 amount);

    constructor(address _poolAddress) {
        pool = FlashLoan(_poolAddress);
        owner = msg.sender;
    }

    // returns funds to pool
    function receiveTokens(address _tokenAddress, uint256 _amount) external{
         require(msg.sender == address(pool), "Sender must be pool");

         require(Token(_tokenAddress).balanceOf(address(this)) == _amount, "Transfer of tokens failed");

         emit LoanReceived(_tokenAddress, _amount);

         // Use your funds here!

          // Return all tokens to the pool
        require(Token(_tokenAddress).transfer(msg.sender, _amount), "Transfer of tokens failed");
    }

    function executeFlashLoan(uint256 _amount) external{
        require(msg.sender == owner, "Only owner can execute");
        pool.flashLoan(_amount);

    }
}
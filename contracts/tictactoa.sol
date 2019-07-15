pragma solidity ^0.5.0;

import './quilhashCoin.sol';

contract tictactoa is quilhashCoin{

     constructor() public{
          
           transfer(address(this),10000000000);
     }


    enum ChannelStatus {
        onlyOneplayerJoined,twoPlayersJoined
    }

   address owner = msg.sender;
   address player1;
   address player2;

   uint betAmount;
   uint round;

    struct Channel{
    bytes32 channelId;
    address p1;
    address p2;
    uint round;
    uint betAmount;
    ChannelStatus status;
    }

    mapping(bytes32 => Channel) Channels;


  function createChannel(bytes32 channelid,address p1,uint _round,uint amount) public{
  require(Channels[channelid].channelId!=channelid);
  Channel memory channel = Channel(
        channelid,
        p1,
        0x0000000000000000000000000000000000000000,
        _round,
        amount,
        ChannelStatus.onlyOneplayerJoined
  );
  Channels[channelid] = channel;
  }

  function joinChannel(bytes32 channelid,address p2) public{
    Channel storage channel = Channels[channelid];
    require(channel.status==ChannelStatus.onlyOneplayerJoined);
    channel.status==ChannelStatus.twoPlayersJoined;
    channel.p2 = p2;
  }
  
 
   
    function getplayersdetails(bytes32 _channelid) public returns(address _player1,address _player2,uint _betAmount,uint _round){
        _player1 = Channels[_channelid].p1;
        _player2 = Channels[_channelid].p2;
        _betAmount = Channels[_channelid].betAmount;
        _round = Channels[_channelid].round;
    }

   
   function stringTobyte32(string memory _b)public pure returns(bytes32 _a){
     
      assembly {
        _a := mload(add(_b, 32))
      }
   }


      function closeChannel(bytes32 channelid,bytes memory sig,string memory message) public{
      require(sig.length == 65);
      bytes32 h = stringTobyte32(message);
      address p1 = Channels[channelid].p1;
      address p2 = Channels[channelid].p2; 
      uint betamount = Channels[channelid].betAmount;
       bytes32 r;
       bytes32 s;
       uint8 v;

       assembly {
           
           r := mload(add(sig, 32))
           
           s := mload(add(sig, 64))
         
           v := byte(0, mload(add(sig, 96)))
       }
          if (ecrecover(h, v, r, s)==p1){transferFrom(owner,p2,2*betamount);delete Channels[channelid];}
          if (ecrecover(h, v, r, s)==p2){transferFrom(owner,p1,2*betamount);delete Channels[channelid];}
       
   }


}
   


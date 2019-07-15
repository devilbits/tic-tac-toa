const inquirer = require('inquirer');
const chalk    = require('chalk');
const figlet   = require('figlet');
const Web3     = require('web3');
const path     = require('path');
const server   = require('http').createServer();
const io       = require('socket.io')(server);
const net      = require('net');

//runing on network id 5777 and port 7545
var web3 = new Web3('http://localhost:7545');

MyContractJSON = require(path.join(__dirname,'../build/contracts/tictactoa.json'));


contractAddress = MyContractJSON.networks['5777'].address;


const abi = MyContractJSON.abi;


MyContract = new web3.eth.Contract(abi, contractAddress);

//console.log('contract=='+contractAddress);

let i=0;
let channelname = "channelname"+i.toString();
var channelid = web3.utils.fromAscii(channelname).toString();





const init = () => {
  console.log(chalk.green(figlet.textSync("Tic tac - Quilhash", {
        font: "Standard",
        horizontalLayout: "default",
        verticalLayout: "default"
      })
    ));
};
//---------------------------Questions----------------------
const haveAccount = ()=>{
	const question = [
         {
      name: 'haveAdrs',
      message: 'Do you have account',
      type:'list',
      choices:['.Yes','.No']
         }
	];
	return inquirer.prompt(question);
}

const loginAccount = ()=>{
	const question = [
         {
      name: 'logInAdrs',
      message: 'Enter your address',
      type:'input'
         },
           {
      name: 'logInPaswd',
      message: 'Enter your password',
      type:'input'
         },
           {
      name: 'token',
      message: 'Enter amount of tokens to buy',
      type:'input'
         }
	];
	return inquirer.prompt(question);	
}


const createAccount = ()=>{
	const question = [
         {
      name: 'paswd',
      message: 'Enter a password to generate Address',
      type:'input',
      
         },
           {
      name: 'token',
      message: 'Enter amount of tokens to buy',
      type:'input',
      }
	];
	return inquirer.prompt(question);	
} 


const newGame = ()=>{
	const question= [{
		name:'createGame',
		message:'Create or join game',
		type:'list',
		choices:['.Join','.Create']
	}];
	return inquirer.prompt(question);
}

const createBet = ()=>{
	const question= [
    {
		name:'betAdrs',
		message:'Enter your address',
		type:'input'
	},
	{
		name:'betAmount',
		message:'Enter the bet amount',
		type:'input'
	},{
		name:'betRound',
		message:'How many rounds?',
		type:'input'
	}
	];
	return inquirer.prompt(question);
}

const acceptBet = ()=>{
	const question= [
	{name:'adrss',type:'input',message:'Enter your address'},
	{name:'betStatus',type:'confirm',message:'Agree to continue'}]
	return inquirer.prompt(question);
}



//--------------------------------*******-----------------------------------------




const run = async ()=>{
	init();
	const temp = await haveAccount();
	const { haveAdrs } = temp;
    let playerData = [];
	if(haveAdrs=='.Yes'){
		const stage1 =async ()=>{
			const temp1 = await loginAccount();
			const {logInAdrs,logInPaswd,token} = temp1;
			web3.eth.personal.unlockAccount(logInAdrs, logInPaswd,300000);
           
			MyContract.methods.transferFrom(contractAddress,logInAdrs,token).send({from:logInAdrs,gas:6000000}).then(x=>{console.log(x)});
            
            //MyContract.methods.balanceOf(contractAddress).call().then(x=>{console.log('====='+x)})
            MyContract.methods.balanceOf(logInAdrs).call().then(x=>{console.log('You bought'+x)}) 
            
            if(playerData[0]==undefined){playerData.push({player1:logInAdrs})}else{playerData.push({player2:logInAdrs})}

            startGame();
	}
	stage1();
	}

	if(haveAdrs=='.No'){
		const stage2 =async ()=>{
			const temp2 = await createAccount();
			const {paswd,token} = temp2;	    
			const adrs =await web3.eth.personal.newAccount(paswd);
			//The newly created might not have enough Eth exicute the function.
			web3.eth.getBalance(adrs).then(x=>{console.log('Your account have '+x+' Ether');if(x==0){console.log('The newly created account do not have enough Eth exicute the function. please perform a ming operation or transfer eth to your account to continue');console.log('-----------------------------------------------------')}})
			MyContract.methods.transferFrom(contractAddress,adrs,token).send({from:adrs,gas:600000});
			console.log('your address is '+adrs);
        	if(playerData[0]==undefined){playerData.push({player1:adrs})}else{playerData.push({player2:adrs})}

        	startGame();
    
	}
	stage2();
	
	}


	const startGame =async ()=>{
		const temp3 = await newGame();
		const { createGame } = temp3;
		if(createGame==".Join"){console.log('Joining game');

			
			const temp4 = await acceptBet();
            const { betStatus,adrss } = temp4;
            if(betStatus==false){client.destroy();}console.log('');
			MyContract.methods.joinChannel(channelid,adrss).send({from:adrss,gas:600000});
			MyContract.methods.getplayersdetails(channelid.toString(),'0x00','0x0000000000000000000000000000000000000000000000000000000000000000','0x3000000000000000000000000000000000000000000000000000000000000000','0x00').call().then(x=>{
				MyContract.methods.transferFrom(x._player2,contractAddress,x._betAmount.toString()).send({from:adrss,gas:600000})
			})

			
			var client = new net.Socket();
			client.connect(1337, '127.0.0.1', function(data) {
				console.log('Connected');

			});

			client.on('data', function(data) {

				if(data.toString()=='lost'){
                    
                    
                          
                    MyContract.methods.getplayersdetails(channelid.toString(),'0x00','0x0000000000000000000000000000000000000000000000000000000000000000','0x3000000000000000000000000000000000000000000000000000000000000000','0x00').call().then(x=>{
                    	console.log(x);
                    //MyContract.methods.transferFrom(contractAddress,x._player1,(2*x._betAmount.toString())).send({from:x._player1,gas:60000});
                   // web3.eth.sign('0x' + toHex('player2 lost'),x._player1).then(x=>{console.log('1=='+x);
          
                      web3.eth.sign('player 2 lost',x._player1).then(sig=>{

                     MyContract.methods.closeChannel(channelid, sig,'player 2 lost').send({from:x._player1,gas:600000});


                })
                   // console.log('1=='+signature)
                })


					client.destroy();}

				if(data.toString().substr().substr(0,9)== 'betAmount'){
					console.log(data.toString);
					
				}	
				console.log(data.toString());
	
				inquirer.prompt([{
					name:'tes',
					message:'>>',
					type:'input',
					validate:(tes)=>{if(tes>0 && tes<10){return true;}else{return "enter a value between 1 to 9"} }
			    	}])
				.then(x=>{//console.log(data.toString());
        			client.write(change(x.tes,data,'X'))
	
				}); 
			})

			client.on('close', function() {console.log('Connection closed');});

		}

		if(createGame==".Create"){console.log('Creating game...');
			const temp5 = await createBet();
    		const {betAmount,betRound,betAdrs} = temp5;
            MyContract.methods.createChannel(channelid,betAdrs,betAmount,betRound).send({from:betAdrs,gas:600000});
            MyContract.methods.transferFrom(betAdrs,contractAddress,betAmount).send({from:betAdrs,gas:600000});
      		

      		var server1 = net.createServer(function(socket) {
      			console.log('waiting...');
				socket.write('betAmount='+betAmount+',betRounds='+betRound);
	//
	
					socket.on('data',data=>{
        				if(data.toString()=='lost'){
        					
                           MyContract.methods.getplayersdetails(channelid.toString(),'0x00','0x0000000000000000000000000000000000000000000000000000000000000000','0x3000000000000000000000000000000000000000000000000000000000000000','0x00').call().then(x=>{
                           	

                           	//MyContract.methods.transferFrom(contractAddress,x._player2,(2*x._betAmount.toString())).send({from:x._player2,gas:600000});


                           		   web3.eth.sign('player 1 lost',x._player2).then(sig=>{
                        MyContract.methods.closeChannel(channelid, sig,'player 1 lost').send({from:x._player2,gas:600000});

                    })



                           })


                            
        					socket.end('quiting...');}
						console.log(data.toString());
    					inquirer.prompt([{
    						name:'tes',
    						message:'>>',
    						type:'input',
    						validate:(tes)=>{if(tes>0 && tes<10){return true;}else{return "enter a value between 1 to 9"}}
    					}])
    					.then(x=>{socket.write(change(x.tes,data,'O'))});
    				});
	//socket.pipe(socket);
			});

		server1.listen(1337, '127.0.0.1');

		}
	}	
}

run();


//---------------------------------------------------------------------
//---------------------------------------------------------------------


const board = ()=>{
 
	return `
                         7 | 8 | 9
                        ---+---+---
                         4 | 5 | 6
                        ---+---+---
                         1 | 2 | 3
  `
}

let count=0;
	let change = (value,currentState,symbol)=>{
 		count++;
 	  	
    	if(currentState==undefined ||currentState.toString().substr(0,9)== 'betAmount'){
    		currentState = board()
     		console.log('board changed..............')
    	}

    	currentState = currentState.toString().replace(value,symbol);
    	if(count>2){
    	    
       // 1 -> 168
       // 2 -> 172
       // 3 -> 176
       // 4 -> 97
       // 5 -> 101
       // 6 -> 105
       // 7 -> 26
       // 8 -> 30
       // 9 -> 34
       

       		let a = {  1:'168',2:'172',3:'176',4:'97',5:'101',6:'105',7:'26',8:'30',9:'34'}
       		let win = [[1,2,3],[4,5,6],[7,8,9],[1,4,7],[2,5,8],[3,6,9],[1,5,9],[3,5,7]]
       		for(let k=0;k<8;k++){
       			let b = currentState.toString()[a[win[k][0]]];
       			let c = currentState.toString()[a[win[k][1]]];
       			let d = currentState.toString()[a[win[k][2]]];

       	 
       			if(d==b && b==c){
       				console.log('You won');
       				return 'lost';
       			}
       		}

    		
       
    	
    	}		

    return currentState;


}


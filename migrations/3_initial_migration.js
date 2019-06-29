const Migrations = artifacts.require("tictactoa");

module.exports = function(deployer,network,accounts) {
	console.log('**************************');
	console.log(accounts);
	console.log('**************************')
  deployer.deploy(Migrations);
};

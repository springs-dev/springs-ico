var Springs = artifacts.require("./SpringsContract.sol");
module.exports = function(deployer) {
  deployer.deploy(Springs, 1000000, web3.toWei('0.01', 'ether'), ['Custom Blockchain Solutions', 'React Native Mobile Development', 'Buisness Automation', 'Browser Automation']);
};
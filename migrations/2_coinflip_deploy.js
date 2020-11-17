const CoinFlip = artifacts.require("CoinFlip");
const SafeMath = artifacts.require("SafeMath");
const ProvableAPI = artifacts.require("usingProvable");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.deploy(ProvableAPI);
  deployer.link(SafeMath, CoinFlip);
  deployer.deploy(CoinFlip).then(function(instance){
    instance = CoinFlip.deployed().then(function(instance){
        instance.addLiquidity({value: web3.utils.toWei("0.1", "ether")})
        .then(function(){
          console.log("Contract has been funded!");
        });
    });
  });
};

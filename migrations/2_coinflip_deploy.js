const CoinFlip = artifacts.require("CoinFlip");
const SafeMath = artifacts.require("SafeMath");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, CoinFlip);
  deployer.deploy(CoinFlip).then(function(instance){
    instance = CoinFlip.deployed().then(function(instance){
        instance.addLiquidity({value: web3.utils.toWei("3", "ether")})
        .then(function(){
          console.log("Contract has been funded!");
        });
    });
  });
};

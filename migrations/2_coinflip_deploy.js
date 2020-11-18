const CoinFlip = artifacts.require("CoinFlip");


module.exports = function(deployer) {
  deployer.deploy(CoinFlip).then(function(instance){
    instance = CoinFlip.deployed().then(function(instance){
        instance.addLiquidity({value: web3.utils.toWei("0.4", "ether")})
        .then(function(){
          console.log("Contract has been funded!");
        });
    });
});
};

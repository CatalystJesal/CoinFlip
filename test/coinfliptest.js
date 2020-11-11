const CoinFlip = artifacts.require("CoinFlip");
const truffleAssert = require("truffle-assertions");


contract("People", async function(accounts){

  let instance;

  before(async function(){

    instance = await CoinFlip.deployed();

  });


it("should allow the owner to add liquidity to the smart contract", async function(){

  await truffleAssert.passes(instance.addLiquidity({value: web3.utils.toWei("1", "ether"), from: accounts[0]}), truffleAssert.ErrorType.REVERT);

});

it("shouldn't allow non-owners to add liquidity to the smart contract", async function(){

  await truffleAssert.fails(instance.addLiquidity({value: web3.utils.toWei("1", "ether"), from: accounts[1]}), truffleAssert.ErrorType.REVERT);

});

it("shouldn't allow a number other than 0 or 1 to be guessed", async function(){

  await truffleAssert.fails(instance.guess(2, {value: web3.utils.toWei("1", "ether"), from: accounts[1]}), truffleAssert.ErrorType.REVERT);
});

it("shouldn't allow a guess for < 1 ETH", async function(){

  await truffleAssert.fails(instance.guess(1, {value: web3.utils.toWei("0.5", "ether"), from: accounts[1]}), truffleAssert.ErrorType.REVERT);
});

it("should allow a guess for for atleast  >= 1 ETH", async function(){

  await truffleAssert.passes(instance.guess(1, {value: web3.utils.toWei("1", "ether"), from: accounts[1]}), truffleAssert.ErrorType.REVERT);
});

it("shouldn't allow a guess if the staking amount > contract balance", async function(){

  await truffleAssert.fails(instance.guess(1, {value: web3.utils.toWei("30", "ether"), from: accounts[1]}), truffleAssert.ErrorType.REVERT);
});

it("should ensure outcome of the guess is either 0 or 1", async function(){

  let outcome;

  await instance.guess(1, {value: web3.utils.toWei("1", "ether"), from: accounts[1]});
  outcome = await instance.outcome.call().then(function(res){return res; });
  assert(outcome == 0 || outcome == 1, "outcome is not 0 or 1");
});

it("shouldn't allow a non-owner to destroy the contract", async function(){
  await truffleAssert.fails(instance.destroy({from: accounts[1]}));

});

it("should allow the owner to destroy the contract", async function(){
  await truffleAssert.passes(instance.destroy({from: accounts[0]}));

});


});

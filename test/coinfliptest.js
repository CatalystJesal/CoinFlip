const CoinFlip = artifacts.require("CoinFlip");
const truffleAssert = require("truffle-assertions");


contract("People", async function(accounts){

  let instance;

  before(async function(){

    instance = await CoinFlip.deployed();

  });

  it("shouldn't allow a flip if the contract balance is 0", async function(){

    await truffleAssert.fails(instance.flip(1, {value: web3.utils.toWei("0.1", "ether"), from: accounts[1]}), truffleAssert.ErrorType.REVERT);
  });


it("should allow the owner to add liquidity to the smart contract", async function(){

  await truffleAssert.passes(instance.addLiquidity({value: web3.utils.toWei("0.4", "ether"), from: accounts[0]}), truffleAssert.ErrorType.REVERT);

});

it("shouldn't allow non-owners to add liquidity to the smart contract", async function(){

  await truffleAssert.fails(instance.addLiquidity({value: web3.utils.toWei("0.4", "ether"), from: accounts[1]}), truffleAssert.ErrorType.REVERT);

});

it("shouldn't allow a number other than 0 or 1 to be guessed", async function(){

  await truffleAssert.fails(instance.flip(2, {value: web3.utils.toWei("1", "ether"), from: accounts[1]}), truffleAssert.ErrorType.REVERT);
});

it("shouldn't allow a flip for < 0.1 ETH", async function(){

  await truffleAssert.fails(instance.flip(1, {value: web3.utils.toWei("0.05", "ether"), from: accounts[1]}), truffleAssert.ErrorType.REVERT);
});

it("should allow a flip for for atleast  >= 0.1 ETH", async function(){

  await truffleAssert.passes(instance.flip(1, {value: web3.utils.toWei("0.1", "ether"), from: accounts[1]}), truffleAssert.ErrorType.REVERT);
});

it("should ensure outcome of the flip is either 0 or 1", async function(){

  let outcome;

  await instance.flip(1, {value: web3.utils.toWei("0.1", "ether"), from: accounts[1]});
  outcome = await instance.outcome.call().then(function(res){return res; });
  assert(outcome == 0 || outcome == 1, "outcome is not 0 or 1");
});

it("should allow user to withdraw all their earnings if earnings > 0, user earnings should go to 0 after withdrawal", async function(){
  let earnings = await instance.getPlayer.call().then(function(rest){res[0]});

  if(earnings > 0){
    await instance.withdraw_earnings({from: accounts[0]});
    earnings = await instance.getPlayer.call().then(function(rest){res[0]});
    assert(earnings == 0, "earnings didn't reset to 0. withdrawal unsuccessful")
  }
});

it("should ensure blockchain contract balance and local contract balance are the same", async function(){
  let balance_fromLocal = await instance.balance.call().then.(function(res){return res; });
  let balance_fromBlockchain = await web3.eth.getBalance(instance.address); //returns a string

  assert(balance_fromLocal.toString() === balance_fromBlockchain, "local contract balance and blockchain balances don't match");

});


it("shouldn't allow a non-owner to destroy the contract", async function(){
  await truffleAssert.fails(instance.destroy({from: accounts[1]}));

});

it("should allow the owner to destroy the contract", async function(){
  await truffleAssert.passes(instance.destroy({from: accounts[0]}));

});


});

var web3 = new Web3(Web3.givenProvider);
var contractInstance;

$(document).ready(function() {
    window.ethereum.enable().then(function(accounts){
      contractInstance = new web3.eth.Contract(abi, "0xDE4c9D58Fb3c339044696F6C2b14d5a69eE22fe9", {from: accounts[0]});
      console.log(contractInstance);
    });

});


function guess(guess, value){

var valueTrim = value.trim()
var guess = guess;


let isnum = /^\d+$/.test(valueTrim);

if(!isnum || valueTrim == 0){
alert("Your input is invalid please enter a valid number");
} else {

var config = {
value: web3.utils.toWei(valueTrim, "ether")
}

$("#guess_0_btn").disabled = true;
$("#guess_1_btn").disabled = true;

contractInstance.methods.guess(guess).send(config)
.on("transactionHash", function(hash){
  console.log(hash);
})
.on("confirmation", function(confirmationNr){
  console.log(confirmationNr);
})
.on("receipt", function(receipt){
  console.log(receipt);
})
.then(function(){


  fetchOutcome(guess);

}).catch((error) =>{
      console.log(error);


})
}
}


async function fetchOutcome(guess){
  await contractInstance.methods.outcome.call().call().then(function(res) {

    if(guess == res){
      console.log("Outcome is " + res + " You win!");
        $("#outcome_display").text("You WIN!");
    } else {
        console.log("Outcome is " + res + " You lose!");
        $("#outcome_display").text("You LOSE!");
    }

    $("#guess_0_btn").disabled = false;
    $("#guess_1_btn").disabled = false;
  }).catch((error) =>{
        console.log(error);
  })

}

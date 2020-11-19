var web3 = new Web3(Web3.givenProvider);
var contractInstance;
var isWaiting;
var guess = 0;

$(document).ready(function() {
    window.ethereum.enable().then(function(accounts){
      contractInstance = new web3.eth.Contract(abi, "0x1442545Ab2D8e1f95284146a6d421eccc9bb085F", {from: accounts[0]});
      console.log(contractInstance);




    });

  contractInstance =  web3.eth.Contract("0x1442545Ab2D8e1f95284146a6d421eccc9bb085F");
    contractInstance.events.FlipOutcome(function(error, result){
        if(!error){
            fetchOutcome(guess, result[1]);
        } else {
          console.log(error);
        }

    });


    $("#heads_0_btn, #tails_1_btn").on("click", flip);

    isWaiting = false;

});





function flip(event){

var btn = $(event.target);
var spend = $("#bet").val().trim();
guess = btn.val();

var validation = new RegExp(/[1-9]\d*(\.\d+)?/);
let isDigits = validation.test(spend);

if(!isDigits || spend == 0){
alert("Your input is invalid please enter a valid number");
} else {

var config = {
value: web3.utils.toWei(spend, "ether")
}

$("#heads_0_btn").disabled = true;
$("#tails_1_btn").disabled = true;

isWaiting = true;

contractInstance.methods.flip(guess).send(config)
.then(function(res){
}).catch((error) =>{
      console.log(error);
      isWaiting = false;

    })
  }
}


async function fetchOutcome(guess, res){
  // await contractInstance.methods.getPlayer.call().call().then(function(res) {

    if(guess == res[4]){
      console.log("Outcome is " + res[4] +" You win!");
        $("#outcome_display").text("It was Heads! You WIN!");
    } else {
        console.log("Outcome is TAILS! " + res[4] + " You lose!");
        $("#outcome_display").text("It was Tails! You LOSE!");
    }

    $("#heads_0_btn").disabled = false;
    $("#tails_1_btn").disabled = false;

    isWaiting = false;
  // }).catch((error) =>{
  //       console.log(error);
  // })

}

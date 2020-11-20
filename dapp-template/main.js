var web3 = new Web3(Web3.givenProvider);
var contractInstance;
var isWaiting;
var latestTransaction;

$(document).ready(function() {
   ethereum.autoRefreshOnNetworkChange = false;
   console.log("document is ready");
    window.ethereum.enable().then(function(accounts){
      contractInstance = new web3.eth.Contract(abi, "0x98A1018e8E17368A4F4FfaD7C69b67DcBd24770D", {from: accounts[0]});
      console.log(contractInstance);

      loadPlayerStats();
      setGameState();

      web3.eth.getTransactionReceipt(latestTransaction, function(){
          //get the latest pending transaction
          //if there is a pending transaction for this contract from this account then we must ensure the UI buttons have been disabled (use setGameState())

      });


});

window.ethereum.on('accountsChanged', function (accounts) {
  contractInstance = new web3.eth.Contract(abi, "0x98A1018e8E17368A4F4FfaD7C69b67DcBd24770D", {from: accounts[0]});
  console.log("We changed accounts to: " + accounts);
  loadPlayerStats();
});



$("#heads_0_btn, #tails_1_btn").on("click", flip);

});



 async function loadPlayerStats() {

    await contractInstance.methods.getPlayer.call().call().then(function(res){
      console.log("balance: " + res[0] + " wins: " + res[1] + " loss: " + res[2]);
      var balance = web3.utils.fromWei(res[0], 'ether');
      $("#balance_output").text(balance + " ETH");
      $("#wins_output").text(res[1]);
      $("#loss_output").text(res[2]);

  });
}

function enableButtons(state){

  if(state){
    $("#heads_0_btn").removeClass('disabled');
    $("#tails_1_btn").removeClass('disabled');
    document.getElementById("heads_0_btn").disabled = false;
    document.getElementById("tails_1_btn").disabled = false;
} else{
  $("#heads_0_btn").addClass('disabled');
  $("#tails_1_btn").addClass('disabled');
  document.getElementById("heads_0_btn").disabled = true;
  document.getElementById("tails_1_btn").disabled = true;
}

}

async function setGameState(){
    await contractInstance.methods.getPlayer.call().call().then(function(res){
        if(res[5] == true){
            console.log("Game is in progress...");
            enableButtons(false);

        } else {
          console.log("No game in progress");
          enableButtons(true);
        }

    });

}

function flip(event){

enableButtons(false);
var btn = $(event.target);
var spend = $("#bet").val().trim();
var guess = btn.val();

var validation = new RegExp(/[1-9]\d*(\.\d+)?/);
let isDigits = validation.test(spend);

if(!isDigits || spend == 0){
alert("Your input is invalid please enter a valid number");
enableButtons(true);
} else {

var config = {
value: web3.utils.toWei(spend, "ether")
}

isWaiting = true;

contractInstance.methods.flip(guess).send(config)
.on("transactionHash", function(hash){
  latestTransaction = hash;
console.log(hash);
})
.then(function(res){

  contractInstance.events.FlipOutcome(function(error, result){
      if(!error){
          fetchOutcome(guess, result);
          console.log("The result is: " + result);
      } else {
        console.log(error);
        }

        })
    }).catch(function(err){
      enableButtons(true);

    })
  }
}


function fetchOutcome(guess, res){
  // await contractInstance.methods.getPlayer.call().call().then(function(res) {
  console.log(res);
    if(guess == res[4]){
      console.log("Outcome is " + res[4] +" You win!");
        $("#outcome_display").text("It was Heads! You WIN!");
          } else {
        console.log("Outcome is " + res[4] + " You lose!");
        $("#outcome_display").text("It was Tails! You LOSE!");
    }

    loadPlayerStats();

    $("#heads_0_btn").removeClass('disabled');
    $("#tails_1_btn").removeClass('disabled');

    enableButtons(true);
    isWaiting = false;
  // }).catch((error) =>{
  //       console.log(error);
  // })

}

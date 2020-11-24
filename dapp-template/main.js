var web3 = new Web3(Web3.givenProvider);
var contractInstance;
var player = {};
var outcomes = ['HEADS', 'TAILS'];

$(document).ready(function() {
  ethereum.autoRefreshOnNetworkChange = false;
  console.log("document is ready");
  window.ethereum.enable().then(function(accounts) {

    contractInstance = new web3.eth.Contract(abi, "0x236A8Fe6427f9e2835cC353893338442C2fd7F84", {
      from: accounts[0]
    });

    console.log(contractInstance.address);

    loadPlayerStats().then(function() {
      setWithdrawBtnState();
      if (player.isWaiting) {
        enableButtons(false);
      } else {
        enableButtons(true);
      }
    })

    clearOutcomeDisplay();
    events();


  });

  $("#heads_0_btn, #tails_1_btn").on("click", flip);
  $("#withdraw_btn").on("click", withdraw);

});


window.ethereum.on('accountsChanged', function(accounts) {
  contractInstance = new web3.eth.Contract(abi, "0x236A8Fe6427f9e2835cC353893338442C2fd7F84", {
    from: accounts[0]
  });
  console.log("We changed accounts to: " + accounts[0]);

  loadPlayerStats().then(function() {
    setWithdrawBtnState();
    if (player.isWaiting) {
      enableButtons(false);
    } else {
      enableButtons(true);
    }
  })
  clearOutcomeDisplay();
  events();

});


function clearOutcomeDisplay() {
  $("#outcome_display").text("????");
}


async function loadPlayerStats() {

  await contractInstance.methods.getPlayer.call().call().then(function(res) {
    player.earnings = res[0];
    player.wins = res[1];
    player.loss = res[2];
    player.latestGuess = res[3];
    player.outcome = res[4];
    player.isWaiting = res[5];

    console.log(player);

    var balance = web3.utils.fromWei(player.earnings, 'ether');
    $("#balance_output").text(balance + " ETH");
    $("#wins_output").text(player.wins);
    $("#loss_output").text(player.loss);

  });
}

function enableButtons(state) {

  if (state) {
    $("#heads_0_btn").removeClass('disabled');
    $("#tails_1_btn").removeClass('disabled');
    document.getElementById("heads_0_btn").disabled = false;
    document.getElementById("tails_1_btn").disabled = false;
  } else {
    $("#heads_0_btn").addClass('disabled');
    $("#tails_1_btn").addClass('disabled');
    document.getElementById("heads_0_btn").disabled = true;
    document.getElementById("tails_1_btn").disabled = true;
  }

}

function setWithdrawBtnState() {
  if (player.earnings == 0) {
    $("#withdraw_btn").addClass('disabled');
    document.getElementById("withdraw_btn").disabled = true;
  } else {
    $("#withdraw_btn").removeClass('disabled');
    document.getElementById("withdraw_btn").disabled = false;
  }
}


function events() {

  contractInstance.events.LatestGuess(function(error, result) {
    if (!error && contractInstance.options.from == result.returnValues.player) {

      player.latestGuess = result.returnValues.guess;
      player.isWaiting = result.returnValues.isWaiting;

      console.log("This means we are waiting = " + !player.isWaiting);
      enableButtons(false);
    } else {
      console.log(error);
      enableButtons(true);
    }
  })

  contractInstance.events.FlipOutcome(function(error, result) {

    if (result.returnValues.player == contractInstance.options.from) {
      console.log("on flip outcome the address is matching " + result.returnValues.player);
      player.outcome = result.returnValues.outcome;
      fetchOutcome();
      enableButtons(true);
      loadPlayerStats().then(function() {
        setWithdrawBtnState();
      })
    }
  })


  contractInstance.events.WithdrawEarnings(function(error, result) {
    console.log("event withdraw: " + result.returnValues.earnings);
    player.earnings -= result.returnValues.earnings;
    $("#balance_output").text(0 + " ETH");
    setWithdrawBtnState();
  })

}



function flip(event) {

  enableButtons(false);
  var btn = $(event.target);
  var spend = $("#bet").val().trim();
  var guess = btn.val();

  var validation = new RegExp(/[0-9]+([.][0-9]+)/);
  let isDigits = validation.test(spend);

  if (!isDigits || spend == 0) {
    alert("Your input is invalid please enter a valid number");
    enableButtons(true);
  } else {
    var config = {
      value: web3.utils.toWei(spend, "ether")
    }

    $("#bet").val("");
    clearOutcomeDisplay();

    enableButtons(false);
    contractInstance.methods.flip(guess).send(config)
      .on("transactionHash", function(hash) {
        latestTransaction = hash;
        console.log(hash);
      })
      .catch(function(error) {
        enableButtons(true);
      })

  }
}


function fetchOutcome() {
  if (player.latestGuess == player.outcome) {
    console.log("Outcome is " + outcomes[player.outcome] + " You win!");
    $("#outcome_display").text("It was " + outcomes[player.outcome] + " You WIN!");
  } else {
    console.log("Outcome is " + outcomes[player.outcome] + " You lose!");
    $("#outcome_display").text("It was " + outcomes[player.outcome] + " You LOSE!");
  }
}

async function withdraw() {
  $("#withdraw_btn").addClass('disabled');
  document.getElementById("withdraw_btn").disabled = true;
  await contractInstance.methods.withdraw_earnings().send()
    .catch(err => {
      $("#withdraw_btn").removeClass('disabled');
      document.getElementById("withdraw_btn").disabled = false;
      console.log(err);

    });
}


//make event emit the queryId
//get the waiting list with query id passed as the key
//check if the player property address is same as the one as the address stored in player array front-end
//if it's the same then show it to the text view else don't

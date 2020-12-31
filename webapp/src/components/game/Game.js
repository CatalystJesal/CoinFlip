import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import RecentWinners from "./RecentWinners";
import Output from "./Output";
import Form from "./Form";

//persist state with redux to preserve state incase we swap to different accounts during gameplay. (DO IF YOU CAN)
//only refresh the state with a new state and store if the state changes

//Re-invoke useEffect call inside RecentWinners to re-populate the data after a game ends

//Disable withdraw button upon user clicking it/ re-enable...change button text to 'Withdrawing...' (Extra not really necessary, just for better UI experience...)

//Code clean-up Game can become GameComponent with functionality while an extra component can be introduced which renders the view only with no functionality
//all property values/results are passed to this component via props

//make UI looks better and more cleaner, use bootstrap or so...

function Game(props) {
  const web3 = props.web3;
  const contractInstance = props.contractInstance;

  const player = props.player;
  const outcomes = useSelector((state) => state.baseProps.outcomes);

  let latestGuess = 0;
  let isWaiting = 0;

  const isRecentWinners = useSelector(
    (state) => state.baseProps.isRecentWinners
  );
  const [isUIEnabled, setIsUIEnabled] = useState(true);
  const [output, setOutput] = useState("Are you Ready?");

  useEffect(() => {
    console.log(player);
    console.log("Game useEffect");
    if (player.isWaiting == 1) {
      setIsUIEnabled(false);
      latestGuess = player.latestGuess;
      isWaiting = player.isWaiting;
      setOutput("Game in progress...");
    } else {
      setIsUIEnabled(true);
      latestGuess = player.latestGuess;
      isWaiting = player.isWaiting;
      setOutput("Are you Ready?");
    }
  }, [contractInstance]);

  useEffect(() => {
    contractInstance.events.LatestGuess(function (error, result) {
      console.log("LatestGuess event fired!");

      if (contractInstance.options.from === result.returnValues.player) {
        latestGuess = result.returnValues.guess;
      } else {
        console.log(error);
      }
    });

    return () => {
      contractInstance.events.LatestGuess().unsubscribe();
    };
  }, [contractInstance]);

  useEffect(() => {
    contractInstance.events.FlipOutcome(function (error, event) {
      console.log("FlipOutcome event fired!");
      if (contractInstance.options.from === event.returnValues.player) {
        isWaiting = 0;
        setIsUIEnabled(true);
        setOutcome(event.returnValues.outcome);
        //this doesn't trigger child component useEffect, find way to do that
        props.fetchPlayerData();
      } else {
        console.log(error);
      }
    });

    //These unsubscribes doesn't even work by the looks of it...
    return () => {
      contractInstance.events.FlipOutcome().unsubscribe();
    };
  }, [contractInstance]);

  const setOutcome = (outcome) => {
    if (latestGuess === outcome) {
      setOutput("It was " + outcomes[outcome] + " You WIN!");
    } else {
      setOutput("It was " + outcomes[outcome] + " You LOSE!");
    }
  };

  const handleCoinFlip = async (event, inputValue) => {
    setIsUIEnabled(false);
    //Heads or Tails?
    const bet = event.target.value;

    //input validation
    var regex = /(([0-9]+[.][0-9]+)|[1-9])/;
    let isValid = regex.test(inputValue);

    if (!isValid) {
      //Notify user of wrong input
      setIsUIEnabled(true);

      alert("Your input is invalid please enter a valid number");
    } else {
      var config = {
        value: props.web3.utils.toWei(inputValue, "ether"),
      };

      console.log(config.value);

      await props.contractInstance.methods
        .flip(bet)
        .send(config)
        .once("transactionHash", function (hash) {
          setIsUIEnabled(false);
          setOutput("Game in progress...");

          console.log(hash);
        })
        .catch(function (error) {
          console.log(error);
          setIsUIEnabled(true);
        });
    }
  };

  return (
    <div className="section">
      <RecentWinners
        contractInstance={contractInstance}
        web3={web3}
        isRecentWinners={isRecentWinners}
      ></RecentWinners>

      <div className="box2">
        <Output output={output}></Output>
        <Form
          isUIEnabled={isUIEnabled}
          isWaiting={player.isWaiting}
          handleCoinFlip={handleCoinFlip}
        ></Form>
      </div>

      <div className="box3"></div>
    </div>
  );
}

export default Game;

import "bootswatch/dist/darkly/bootstrap.min.css";
import "./App.css";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  change_isPlayerDataLoaded,
  fetch_PlayerSuccess,
  fetch_PlayerFailure,
} from "./redux/player/playerActions";

import { resetState } from "./redux/baseProps/basePropsActions";

import Scoreboard from "./components/scoreboard/Scoreboard";
import Game from "./components/game/Game";
import Footer from "./components/Footer";
import Faq from "./components/Faq";
import Web3 from "web3";
import { abi } from "./abi";
import { BrowserRouter, Switch, Route } from "react-router-dom";

const web3 = new Web3(Web3.givenProvider);
const contractAddress = "0x0e0058c717143310ad5d42da54c4f18ae01e7eba";
var contractInstance = new web3.eth.Contract(abi, contractAddress);

//TO DO: Fix bug where upon losing the outcome span shifts between different outcomes
function App() {
  const player = useSelector((state) => state.player.player);
  const isLoaded_PlayerData = useSelector(
    (state) => state.player.isLoaded_PlayerData
  );

  const dispatch = useDispatch();

  useEffect(function () {
    console.log("useEffect - on player address change / initial");
    window.ethereum.autoRefreshOnNetworkChange = false;
    window.ethereum.enable().then((accounts) => {
      contractInstance = new web3.eth.Contract(abi, contractAddress, {
        from: accounts[0],
      });

      fetchPlayerData();
    });
  }, []);

  //IMPORTANT: EVENTS SHOULD BE DIRECTLY PUT INSIDE useEffect, not doing so leads to those events firing many times!

  //Metamask events
  useEffect(() => {
    window.ethereum.on("accountsChanged", (accounts) => {
      console.log("Accounts changed!");
      dispatch(resetState());
      window.ethereum.enable().then((accounts) => {
        contractInstance = new web3.eth.Contract(abi, contractAddress, {
          from: accounts[0],
        });

        fetchPlayerData();
      });

      contractInstance.options.from = accounts[0];

      window.ethereum.on("chainChanged", (chainId) => {
        console.log("Please use Ropsten testnet");
        window.ethereum.autoRefreshOnNetworkChange = false;
      });
    });
  }, []);

  const handleChange_isPlayerDataLoaded = (value) => {
    console.log("handler called");
    change_isPlayerDataLoaded(value);
  };

  const fetchPlayerData = async () => {
    await contractInstance.methods.getPlayer
      .call()
      .call()
      .then((res) => {
        const currentPlayer = {
          earnings: res[0],
          wins: res[1],
          loss: res[2],
          latestGuess: res[3],
          outcome: res[4],
          isWaiting: res[5],
          earningsFromWei: web3.utils.fromWei(res[0], "ether") + " ETH",
        };

        dispatch(fetch_PlayerSuccess(currentPlayer));
      })
      .catch((error) => {
        dispatch(fetch_PlayerFailure(error.message));
      });
  };

  return (
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          <h1>CoinFlip</h1>
        </header>
        <Scoreboard
          contractInstance={contractInstance}
          web3={web3}
          player={player}
          fetchPlayerData={fetchPlayerData}
        ></Scoreboard>
        <Switch>
          <Route path="/FAQ">
            <Faq></Faq>
            <Footer routeTo={"/"} routeName={"Game"}></Footer>
          </Route>
          <Route exact path="/">
            <Game
              contractInstance={contractInstance}
              web3={web3}
              player={player}
              isLoaded_PlayerData={isLoaded_PlayerData}
              handleChange_isPlayerDataLoaded={handleChange_isPlayerDataLoaded}
              fetchPlayerData={fetchPlayerData}
            ></Game>
            <Footer routeTo={"/FAQ"} routeName={"FAQ"}></Footer>
          </Route>
        </Switch>
      </div>
    </BrowserRouter>
  );
}

export default App;

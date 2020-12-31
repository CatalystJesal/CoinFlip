import { useSelector } from "react-redux";
import WithdrawButton from "./WithdrawButton";

function Scoreboard(props) {
  const contractInstance = props.contractInstance;
  const player = useSelector((state) => state.player.player);

  return (
    <div className="navigation navbar-dark bg-primary">
      <div className="balanceDiv">
        Earnings: <span>{player.earningsFromWei}</span>
      </div>
      <div className="scoreboardDiv">
        Win: <span>{player.wins}</span>
        Loss: <span>{player.loss}</span>
      </div>
      <WithdrawButton
        contractInstance={contractInstance}
        playerEarnings={player.earnings}
        fetchPlayerData={props.fetchPlayerData}
      ></WithdrawButton>
    </div>
  );
}

export default Scoreboard;

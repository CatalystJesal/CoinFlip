import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

function WithdrawButton(props) {
  const web3 = props.web3;
  const contractInstance = props.contractInstance;
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const playerEarnings = useSelector((state) => state.player.player.earnings);

  useEffect(() => {
    contractInstance.events.WithdrawEarnings(function (error, result) {
      console.log("Withdraw event fired!");
      if (!error) {
        //handler for the App component to deal with this request
        props.fetchPlayerData(contractInstance, web3);
        setIsWithdrawing(false);
      } else {
        console.log(error);
      }
    });

    // return () => {
    //   contractInstance.events.LatestGuess().unsubscribe();
    // };
  }, [contractInstance]);

  // useEffect(() => {
  //   const data = localStorage.getItem("isWithdrawing");
  //   if (data) {
  //     setIsWithdrawing(JSON.parse(data));
  //   }
  // }, []);

  // useEffect(() => {
  //   localStorage.setItem("isWithdrawing", JSON.stringify(isWithdrawing));
  // });

  const handleWithdraw = (event) => {
    event.preventDefault();

    setIsWithdrawing(true);
    contractInstance.methods
      .withdraw_earnings()
      .send()
      .then()
      .catch((err) => {
        setIsWithdrawing(false);
        console.log(err);
      });
  };

  return (
    <div className="withdrawDiv">
      <button
        className={"btn btn-secondary"}
        disabled={playerEarnings <= 0 ? true : false}
        onClick={handleWithdraw}
      >
        {!isWithdrawing ? `Withdraw earnings` : `Withdrawing...`}
      </button>
    </div>
  );
}

export default WithdrawButton;

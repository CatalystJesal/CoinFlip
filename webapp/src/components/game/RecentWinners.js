import React from "react";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
  fetch_RecentWinnersSuccess,
  fetch_RecentWinnersFailure,
} from "../../redux/baseProps/basePropsActions";

function RecentWinners(props) {
  const web3 = props.web3;
  const contractInstance = props.contractInstance;
  const recordLimit = 5;
  const isRecentWinners = props.isRecentWinners;

  const recentWinners = useSelector((state) => state.baseProps.recentWinners);

  const dispatch = useDispatch();

  useEffect(() => {
    getRecentWinners();
    console.log("Recent Winners useEffect()");
  }, [isRecentWinners]);

  const getRecentWinners = () => {
    contractInstance.getPastEvents(
      "FlipOutcome",
      {
        fromBlock: 0,
        toBlock: "latest",
      },
      function (error, event) {
        if (!error) {
          transformData(event, recordLimit);
        } else {
          dispatch(fetch_RecentWinnersFailure(error.message));
        }
      }
    );
  };

  const transformData = (eventData, recordLimit) => {
    var records = [];
    eventData.reverse().map((data) => {
      if (data.returnValues.won > 0) {
        const winner = {
          blockNumber: data.blockNumber,
          timestamp: 0,
          address: data.returnValues.player,
          won: web3.utils.fromWei(data.returnValues.won, "ether") + " ETH",
        };

        records.push(winner);
      }
    });

    dispatch(fetch_RecentWinnersSuccess(records.slice(0, recordLimit)));
  };

  const showTableRow = () => {
    return recentWinners.map(({ blockNumber, address, won }) => (
      <tr className="table-active" key={blockNumber}>
        <td>{address}</td>
        <td>{won}</td>
      </tr>
    ));
  };

  return (
    <div className="box1">
      <table className="table">
        <tbody>
          <tr className="tableHeader">
            <th>Recent wins:</th>
          </tr>
          <tr className="table-active">
            <th scope="col">Address</th>
            <th scope="col">Won</th>
          </tr>
          {isRecentWinners ? (
            showTableRow()
          ) : (
            <tr>
              <td>loading...</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default RecentWinners;

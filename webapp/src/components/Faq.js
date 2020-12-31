import React from "react";

export default function Faq(props) {
  // console.log(location);
  return (
    <div className="faqDiv">
      <div className="faqContentDiv">
        <h5>How do I play?</h5>
        <p>
          Supply the number of ETH you would like to bet (
          <i>At least 0.1 ETH required</i>). Then click the coin side you expect
          to be rolled. Guess correctly to double your bet value.
        </p>
        <h5>Why is it taking so long for the result to show?</h5>
        <p>
          The transaction has to be mined by the blockchain and so due to the
          demands of the network it may take a little longer than usual for the
          result to be displayed.
        </p>
        <p>
          Also, be warned that you may never get a result from your game due to
          the unpredictable nature of Ropsten network testnet. This is beyond
          the control of any application developer.
        </p>
        <h5>How did you create this application?</h5>
        <p>
          Thanks to the Ivan On Tech Blockchain Academy I was able to learn
          skills in Solidity and enhance my existing React development skills to
          create this application.
        </p>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useSelector } from "react-redux";

function Output(props) {
  const output = props.output;

  return (
    <div className="outcomeDiv">
      <h3>{output}</h3>
    </div>
  );
}

export default Output;

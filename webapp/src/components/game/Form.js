import React, { useState } from "react";

function Form(props) {
  const [inputValue, setInputValue] = useState("");
  const inputOnChange = (event) => {
    setInputValue(event.target.value.replace(/\s/g, ""));
  };

  const handleOnClick = (event) => {
    event.preventDefault();
    props.handleCoinFlip(event, inputValue);
  };

  const isUIEnabled = props.isUIEnabled;

  // console.log("IsUIEnabled: " + !props.isUIEnabled);

  return (
    <form>
      <div className="formDiv">
        <label>Eth to bet</label>
        <input
          type="text"
          placeholder="e.g. 0.1, 0.2, 1, 2, 3..."
          value={!isUIEnabled ? "" : inputValue}
          onChange={inputOnChange}
        ></input>
        <div className="btnGroup">
          <button
            className="btn btn-outline-primary"
            disabled={!isUIEnabled}
            value={"0"}
            onClick={handleOnClick}
          >
            Heads
          </button>
          <button
            className="btn btn-outline-primary"
            disabled={!isUIEnabled}
            value={"1"}
            onClick={handleOnClick}
          >
            Tails
          </button>
        </div>
      </div>
    </form>
  );
}

export default Form;

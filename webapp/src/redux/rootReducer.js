import { combineReducers } from "redux";
import basePropsReducer from "./baseProps/basePropsReducer";
import playerReducer from "./player/playerReducer";

const rootReducer = combineReducers({
  baseProps: basePropsReducer,
  player: playerReducer,
});

export default rootReducer;

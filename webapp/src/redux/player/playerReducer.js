import {
  FETCH_PLAYER_DATA_SUCCESS,
  FETCH_PLAYER_DATA_FAILURE,
  CHANGE_ISPLAYERLOADED,
} from "./playerTypes";

const initialState = {
  isLoaded_PlayerData: false,
  fetch_playerData_error: "",
  player: {
    earnings: 0,
    wins: 0,
    loss: 0,
    latestGuess: 0,
    outcome: 0,
    isWaiting: 0,
    earningsFromWei: "",
  },
};

const playerReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PLAYER_DATA_SUCCESS:
      return {
        ...state,
        player: action.payload,
        isLoaded_PlayerData: true,
      };

    case FETCH_PLAYER_DATA_FAILURE:
      return {
        ...state,
        fetch_playerData_error: action.payload,
      };

    case CHANGE_ISPLAYERLOADED:
      return {
        ...state,
        isLoaded_PlayerData: action.payload,
      };

    default:
      return state;
  }
};

export default playerReducer;

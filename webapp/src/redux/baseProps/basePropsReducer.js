import {
  FETCH_RECENT_WINNERS_SUCCESS,
  FETCH_RECENT_WINNERS_FAILURE,
  CHANGE_ISRECENTWINNERS,
  RESET_STATE,
} from "./basePropsTypes";

const initialState = {
  isGameUIDisabled: false,
  isWithdrawDisabled: false,
  outputValue: "Are you Ready?",
  isRecentWinners: false,
  outcomes: ["HEADS", "TAILS"],
  recentWinners: [],
  fetch_recentWinners_error: "",
  fetch_blockTimeStamps_error: "",
};

const basePropsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_RECENT_WINNERS_SUCCESS:
      return {
        ...state,
        recentWinners: action.payload,
        fetch_recentWinners_error: "",
        isRecentWinners: true,
      };
    case FETCH_RECENT_WINNERS_FAILURE:
      return {
        ...state,
        fetch_recentWinners_error: action.payload,
      };

    case CHANGE_ISRECENTWINNERS:
      return {
        ...state,
        isRecentWinners: action.payload,
      };

    case RESET_STATE:
      return {
        isGameUIDisabled: false,
        isWithdrawDisabled: false,
        isRecentWinners: false,
        outcomes: ["HEADS", "TAILS"],
        recentWinners: [],
        fetch_recentWinners_error: "",
        isTimeStampsLoaded: false,
        fetch_blockTimeStamps_error: "",
      };

    default:
      return state;
  }
};

export default basePropsReducer;

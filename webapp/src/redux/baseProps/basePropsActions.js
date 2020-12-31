import {
  FETCH_RECENT_WINNERS_SUCCESS,
  FETCH_RECENT_WINNERS_FAILURE,
  CHANGE_ISRECENTWINNERS,
  RESET_STATE,
} from "./basePropsTypes";

export const resetState = () => {
  return {
    type: RESET_STATE,
  };
};

export const fetch_RecentWinnersSuccess = (winners) => {
  return {
    type: FETCH_RECENT_WINNERS_SUCCESS,
    payload: winners,
  };
};

export const fetch_RecentWinnersFailure = (error) => {
  return {
    type: FETCH_RECENT_WINNERS_FAILURE,
    payload: error,
  };
};

export const change_IsRecentWinners = (value) => {
  return {
    type: CHANGE_ISRECENTWINNERS,
    payload: value,
  };
};

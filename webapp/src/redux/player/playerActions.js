import {
  FETCH_PLAYER_DATA_SUCCESS,
  FETCH_PLAYER_DATA_FAILURE,
  CHANGE_ISPLAYERLOADED,
} from "./playerTypes";

export const fetch_PlayerSuccess = (playerData) => {
  return {
    type: FETCH_PLAYER_DATA_SUCCESS,
    payload: playerData,
  };
};

export const fetch_PlayerFailure = (error) => {
  return {
    type: FETCH_PLAYER_DATA_FAILURE,
    payload: error,
  };
};

export const change_isPlayerDataLoaded = (value) => {
  return {
    type: CHANGE_ISPLAYERLOADED,
    paylaod: value,
  };
};

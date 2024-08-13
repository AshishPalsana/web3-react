import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  basicConfigForm: {},
  saveDraftData: null,
  savedFirstStep: null,
  loader: false,
  currentFormStep: 1,
  isNextFetch: {},
  isEditUserId: false,
  noLimit: {
    numberOfAllowlist: 25,
    numberOfGroups: 20,
    allowListMaxDiscordRolesInServer: 5,
    allowListMaxDiscordServers: 5,
  },
  discordServerData: [],
  leaderboardData: [],
  dashboardData: { data: [], metadata: {} },
};

export const reducer = createSlice({
  name: "basicConfigForm",
  initialState,
  reducers: {
    setBasicConfigForm: (state, { payload }) => {
      state.basicConfigForm = payload;
    },
    setSaveDraftData: (state, { payload }) => {
      state.saveDraftData = payload;
    },
    setSavedFirstStep: (state, { payload }) => {
      state.savedFirstStep = payload;
    },
    setLoader: (state, { payload }) => {
      state.loader = payload;
    },
    setCurrentFormStep: (state, { payload }) => {
      state.currentFormStep = payload;
    },
    setIsNextFetch: (state, { payload }) => {
      state.isNextFetch = payload;
    },
    setIsEditUserId: (state, { payload }) => {
      state.isEditUserId = payload;
    },
    setDiscordServerData: (state, { payload }) => {
      state.discordServerData = payload;
    },
    setNoLimit: (state, { payload }) => {
      state.noLimit.numberOfGroups = Number(payload?.numberOfGroups);
      state.noLimit.numberOfAllowlist = Number(payload?.numberOfAllowlist);
      state.noLimit.allowListMaxDiscordRolesInServer = Number(payload?.allowListMaxDiscordRolesInServer);
      state.noLimit.allowListMaxDiscordServers = Number(payload?.allowListMaxDiscordServers);
    },
    setLeaderboardData: (state, { payload }) => {
      state.leaderboardData = payload;
    },
    setDashboardData: (state, { payload }) => {
      state.dashboardData = payload;
    },
  },
});

export const {
  setBasicConfigForm,
  setSaveDraftData,
  setSavedFirstStep,
  setLoader,
  setCurrentFormStep,
  setIsNextFetch,
  setIsEditUserId,
  setNoLimit,
  setDiscordServerData,
  setLeaderboardData,
  setDashboardData,
} = reducer.actions;

export default reducer.reducer;

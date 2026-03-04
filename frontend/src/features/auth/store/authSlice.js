import { createSlice } from "@reduxjs/toolkit";
import {
  AUTH_INITIAL_SLICE_STATE,
  AUTH_STATUS,
  normalizeAuthErrorCode,
} from "../types";

const authSlice = createSlice({
  name: "auth",
  initialState: AUTH_INITIAL_SLICE_STATE,
  reducers: {
    bootstrapAuthStart(state) {
      state.status = AUTH_STATUS.bootstrapping;
      state.error = null;
    },
    bootstrapAuthSuccess(state, action) {
      const payload = action.payload || {};
      state.status = payload.isAuthenticated
        ? AUTH_STATUS.authenticated
        : AUTH_STATUS.unauthenticated;
      state.isAuthenticated = Boolean(payload.isAuthenticated);
      state.user = payload.user || null;
      state.accessToken = payload.accessToken || null;
      state.refreshToken = payload.refreshToken || null;
      state.lastUpdatedAt = Date.now();
      state.error = null;
    },
    loginSuccess(state, action) {
      const payload = action.payload || {};
      state.status = AUTH_STATUS.authenticated;
      state.isAuthenticated = true;
      state.user = payload.user || null;
      state.accessToken = payload.accessToken || null;
      state.refreshToken = payload.refreshToken || null;
      state.pendingTwoFactor = Boolean(payload.pendingTwoFactor);
      state.successMessage = payload.successMessage || null;
      state.error = null;
      state.lastUpdatedAt = Date.now();
    },
    setPendingTwoFactor(state, action) {
      state.pendingTwoFactor = Boolean(action.payload);
    },
    logoutSuccess(state) {
      state.status = AUTH_STATUS.unauthenticated;
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.pendingTwoFactor = false;
      state.error = null;
      state.successMessage = null;
      state.lastUpdatedAt = Date.now();
    },
    authError(state, action) {
      const message = action.payload || "Authentication failed.";
      state.status = AUTH_STATUS.error;
      state.error = {
        message,
        code: normalizeAuthErrorCode(message),
      };
      state.successMessage = null;
      state.lastUpdatedAt = Date.now();
    },
    updateAuthUser(state, action) {
      state.user = action.payload || null;
      state.lastUpdatedAt = Date.now();
    },
    rememberEmail(state, action) {
      state.rememberedEmail = action.payload || "";
      state.lastUpdatedAt = Date.now();
    },
    clearAuthMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
});

export const {
  bootstrapAuthStart,
  bootstrapAuthSuccess,
  loginSuccess,
  setPendingTwoFactor,
  logoutSuccess,
  authError,
  updateAuthUser,
  rememberEmail,
  clearAuthMessages,
} = authSlice.actions;

export default authSlice.reducer;

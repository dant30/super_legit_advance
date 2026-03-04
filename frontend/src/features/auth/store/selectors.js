export const selectAuthState = (state) => state?.auth || {};
export const selectAuthStatus = (state) => selectAuthState(state).status || "idle";
export const selectIsAuthenticated = (state) => Boolean(selectAuthState(state).isAuthenticated);
export const selectAuthUser = (state) => selectAuthState(state).user || null;
export const selectAuthError = (state) => selectAuthState(state).error || null;
export const selectPendingTwoFactor = (state) =>
  Boolean(selectAuthState(state).pendingTwoFactor);

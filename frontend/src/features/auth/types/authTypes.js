export const AUTH_STORAGE_KEYS = Object.freeze({
  accessToken: "access_token",
  refreshToken: "refresh_token",
  user: "user",
  rememberedEmail: "remembered_email",
});

export const AUTH_STATUS = Object.freeze({
  idle: "idle",
  bootstrapping: "bootstrapping",
  authenticated: "authenticated",
  unauthenticated: "unauthenticated",
  error: "error",
});

export const AUTH_ROLE = Object.freeze({
  admin: "admin",
  staff: "staff",
  officer: "officer",
  customer: "customer",
});

export const AUTH_ERROR_CODE = Object.freeze({
  invalidCredentials: "invalid_credentials",
  tokenExpired: "token_expired",
  accountLocked: "account_locked",
  networkError: "network_error",
  unknown: "unknown",
});

export const AUTH_PASSWORD_POLICY = Object.freeze({
  minLength: 6,
});

export const AUTH_DEFAULTS = Object.freeze({
  loginPayload: {
    email: "",
    password: "",
    remember: false,
  },
  resetPayload: {
    password: "",
    confirmPassword: "",
  },
});

export const AUTH_INITIAL_SLICE_STATE = Object.freeze({
  status: AUTH_STATUS.idle,
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  rememberedEmail: "",
  pendingTwoFactor: false,
  error: null,
  successMessage: null,
  lastUpdatedAt: null,
});

export const AUTH_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeAuthErrorCode(message) {
  const text = String(message || "").toLowerCase();
  if (text.includes("credential") || text.includes("invalid")) {
    return AUTH_ERROR_CODE.invalidCredentials;
  }
  if (text.includes("expired") || text.includes("token")) {
    return AUTH_ERROR_CODE.tokenExpired;
  }
  if (text.includes("locked")) {
    return AUTH_ERROR_CODE.accountLocked;
  }
  if (text.includes("network")) {
    return AUTH_ERROR_CODE.networkError;
  }
  return AUTH_ERROR_CODE.unknown;
}

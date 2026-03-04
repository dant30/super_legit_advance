const TOKEN_KEY = "sla.auth.token";
const TOKEN_SCHEME_KEY = "sla.auth.token.scheme";
const REFRESH_TOKEN_KEY = "sla.auth.refresh";
const ACTIVE_ORGANIZATION_KEY = "sla.active.organization.id";
const ENTITLEMENTS_CACHE_KEY = "sla.entitlements.cache.v1";

export function getAuthToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token, scheme = "Token") {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(TOKEN_SCHEME_KEY, scheme);
}

export function getAuthTokenScheme() {
  return window.localStorage.getItem(TOKEN_SCHEME_KEY) || "Token";
}

export function setRefreshToken(token) {
  if (!token) {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    return;
  }
  window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function getRefreshToken() {
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearAuthToken() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(TOKEN_SCHEME_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getActiveOrganizationId() {
  return window.localStorage.getItem(ACTIVE_ORGANIZATION_KEY);
}

export function setActiveOrganizationId(organizationId) {
  if (!organizationId) {
    window.localStorage.removeItem(ACTIVE_ORGANIZATION_KEY);
    return;
  }
  window.localStorage.setItem(ACTIVE_ORGANIZATION_KEY, String(organizationId));
}

export function clearActiveOrganizationId() {
  window.localStorage.removeItem(ACTIVE_ORGANIZATION_KEY);
}

export function getEntitlementsCache() {
  try {
    const raw = window.localStorage.getItem(ENTITLEMENTS_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function setEntitlementsCache(cache) {
  try {
    window.localStorage.setItem(ENTITLEMENTS_CACHE_KEY, JSON.stringify(cache || {}));
  } catch {
    return;
  }
}

export function clearEntitlementsCache() {
  window.localStorage.removeItem(ENTITLEMENTS_CACHE_KEY);
}

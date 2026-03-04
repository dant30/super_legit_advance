const TOKEN_KEY = "sla.auth.token";
const TOKEN_SCHEME_KEY = "sla.auth.token.scheme";
const REFRESH_TOKEN_KEY = "sla.auth.refresh";
const ENTITLEMENTS_CACHE_KEY = "sla.entitlements.cache.v1";

function getStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getAuthToken() {
  const storage = getStorage();
  return storage ? storage.getItem(TOKEN_KEY) : null;
}

export function setAuthToken(token, scheme = "Token") {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(TOKEN_SCHEME_KEY, scheme);
}

export function getAuthTokenScheme() {
  const storage = getStorage();
  return storage?.getItem(TOKEN_SCHEME_KEY) || "Token";
}

export function setRefreshToken(token) {
  const storage = getStorage();
  if (!storage) return;
  if (!token) {
    storage.removeItem(REFRESH_TOKEN_KEY);
    return;
  }
  storage.setItem(REFRESH_TOKEN_KEY, token);
}

export function getRefreshToken() {
  const storage = getStorage();
  return storage ? storage.getItem(REFRESH_TOKEN_KEY) : null;
}

export function clearAuthToken() {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(TOKEN_KEY);
  storage.removeItem(TOKEN_SCHEME_KEY);
  storage.removeItem(REFRESH_TOKEN_KEY);
}

export function getEntitlementsCache() {
  const storage = getStorage();
  if (!storage) return {};
  try {
    const raw = storage.getItem(ENTITLEMENTS_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function setEntitlementsCache(cache) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(ENTITLEMENTS_CACHE_KEY, JSON.stringify(cache || {}));
  } catch {
    return;
  }
}

export function clearEntitlementsCache() {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(ENTITLEMENTS_CACHE_KEY);
}

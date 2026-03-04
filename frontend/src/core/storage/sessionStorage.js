function getSessionStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function getSessionItem(key) {
  const storage = getSessionStorage();
  return storage ? storage.getItem(key) : null;
}

export function setSessionItem(key, value) {
  const storage = getSessionStorage();
  if (!storage) return;
  storage.setItem(key, value);
}

export function removeSessionItem(key) {
  const storage = getSessionStorage();
  if (!storage) return;
  storage.removeItem(key);
}

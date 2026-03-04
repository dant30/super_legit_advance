export function getSessionItem(key) {
  return window.sessionStorage.getItem(key);
}

export function setSessionItem(key, value) {
  window.sessionStorage.setItem(key, value);
}

export function removeSessionItem(key) {
  window.sessionStorage.removeItem(key);
}

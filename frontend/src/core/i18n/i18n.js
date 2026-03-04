import { DEFAULT_LOCALE, LOCALES, SUPPORTED_LOCALES } from "./locales";

let currentLocale = DEFAULT_LOCALE;

function getByPath(obj, path) {
  if (!obj || !path) return undefined;
  return path.split(".").reduce((acc, key) => {
    if (acc == null) return undefined;
    return acc[key];
  }, obj);
}

export function setLocale(locale) {
  const next = String(locale || "").trim().toLowerCase();
  if (SUPPORTED_LOCALES.includes(next)) {
    currentLocale = next;
    return currentLocale;
  }
  return currentLocale;
}

export function getLocale() {
  return currentLocale;
}

export function t(key, fallback = "") {
  const localDict = LOCALES[currentLocale] || LOCALES[DEFAULT_LOCALE] || {};
  const value = getByPath(localDict, key);
  if (typeof value === "string") return value;
  if (fallback) return fallback;
  return key;
}

export const i18n = {
  t,
  setLocale,
  getLocale,
  supportedLocales: SUPPORTED_LOCALES,
};

export default i18n;

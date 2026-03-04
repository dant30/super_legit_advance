import { t } from "../i18n/i18n";

function firstEntry(obj) {
  const key = Object.keys(obj || {})[0];
  if (!key) return null;
  return [key, obj[key]];
}

export function normalizeError(error) {
  const response = error?.response;
  const data = response?.data;

  if (!data) {
    return {
      status: response?.status || null,
      message: error?.message || t("errors.unexpected", "Unexpected error."),
      details: null,
    };
  }

  if (typeof data === "string") {
    return { status: response?.status || null, message: data, details: data };
  }

  if (typeof data.detail === "string") {
    return { status: response?.status || null, message: data.detail, details: data };
  }

  if (typeof data.message === "string") {
    return { status: response?.status || null, message: data.message, details: data };
  }

  const entry = firstEntry(data);
  if (entry) {
    const [key, value] = entry;
    if (Array.isArray(value) && value[0]) {
      return {
        status: response?.status || null,
        message: `${key}: ${value[0]}`,
        details: data,
      };
    }
    if (typeof value === "string") {
      return {
        status: response?.status || null,
        message: `${key}: ${value}`,
        details: data,
      };
    }
  }

  return {
    status: response?.status || null,
    message: t("errors.unexpected", "Unexpected error."),
    details: data,
  };
}

export function getErrorMessage(error, fallback = t("errors.unexpected", "Unexpected error.")) {
  return normalizeError(error).message || fallback;
}

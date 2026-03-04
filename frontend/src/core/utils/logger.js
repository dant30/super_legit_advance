const LEVEL_ORDER = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function resolveConfiguredLevel() {
  const fromWindow = globalThis?.__APP_LOG_LEVEL__;
  if (typeof fromWindow === "string" && fromWindow.trim()) {
    return fromWindow.trim().toLowerCase();
  }
  const fromViteEnv = import.meta?.env?.VITE_LOG_LEVEL;
  if (typeof fromViteEnv === "string" && fromViteEnv.trim()) {
    return fromViteEnv.trim().toLowerCase();
  }
  return "info";
}

const configuredLevel = resolveConfiguredLevel();
const minLevel = LEVEL_ORDER[configuredLevel] || LEVEL_ORDER.info;

function shouldLog(level) {
  return (LEVEL_ORDER[level] || 0) >= minLevel;
}

function formatPayload(message, meta = {}) {
  return {
    ts: new Date().toISOString(),
    message,
    ...meta,
  };
}

export const logger = {
  debug(message, meta) {
    if (!shouldLog("debug")) return;
    console.debug(formatPayload(message, meta));
  },
  info(message, meta) {
    if (!shouldLog("info")) return;
    console.info(formatPayload(message, meta));
  },
  warn(message, meta) {
    if (!shouldLog("warn")) return;
    console.warn(formatPayload(message, meta));
  },
  error(message, meta) {
    if (!shouldLog("error")) return;
    console.error(formatPayload(message, meta));
  },
};

export default logger;

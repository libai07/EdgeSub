export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

function getLogLevel(env) {
  const level = String(env?.LOG_LEVEL || "").toLowerCase();
  switch (level) {
    case "debug": return LogLevel.DEBUG;
    case "info": return LogLevel.INFO;
    case "warn": return LogLevel.WARN;
    case "error": return LogLevel.ERROR;
    default: return LogLevel.INFO;
  }
}

function formatMessage(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
}

export function createLogger(env) {
  const level = getLogLevel(env);
  return {
    debug: (msg, meta) => {
      if (level <= LogLevel.DEBUG) console.log(formatMessage("DEBUG", msg, meta));
    },
    info: (msg, meta) => {
      if (level <= LogLevel.INFO) console.log(formatMessage("INFO", msg, meta));
    },
    warn: (msg, meta) => {
      if (level <= LogLevel.WARN) console.warn(formatMessage("WARN", msg, meta));
    },
    error: (msg, meta) => {
      if (level <= LogLevel.ERROR) console.error(formatMessage("ERROR", msg, meta));
    },
  };
}
type LogLevel = "info" | "warn" | "error" | "debug"

function log(level: LogLevel, data: Record<string, unknown>) {
  const entry = {
    level,
    timestamp: new Date().toISOString(),
    ...data,
  }

  if (process.env.NODE_ENV === "production") {
    console.log(JSON.stringify(entry))
  } else {
    const colors: Record<LogLevel, string> = {
      info:  "\x1b[36m",
      warn:  "\x1b[33m",
      error: "\x1b[31m",
      debug: "\x1b[90m",
    }
    const { level: lvl, timestamp, ...rest } = entry
    console.log(`${colors[lvl]}[${lvl.toUpperCase()}]\x1b[0m`, timestamp, rest)
  }
}

export const logger = {
  info:  (data: Record<string, unknown>) => log("info",  data),
  warn:  (data: Record<string, unknown>) => log("warn",  data),
  error: (data: Record<string, unknown>) => log("error", data),
  debug: (data: Record<string, unknown>) => log("debug", data),
}

import { createLogger, format, level, transports } from "winston";
import { config } from "../config/config";

export const logger = createLogger({
  level: config.NODE_ENV === "production" ? "info" : "debug",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
    format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level.toUpperCase()}] ${message} ${
        stack ? `\n${stack}` : ""
      }`;
    })
  ),
  transports: [
    new transports.Console({
      format: format.colorize({ all: true }),
      silent: config.NODE_ENV !== "development", // dont log in production
    }),
    new transports.File({
      filename: "logs/error.log",
      level: "error",
      silent: config.NODE_ENV !== "production", // dont save in development
    }),
    new transports.File({
      filename: "logs/combined.log",
      silent: config.NODE_ENV !== "production", // dont save in development
    }),
  ],
});

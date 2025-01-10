import express from "express";
import winston from "winston";
import morgan from "morgan";
import * as dotenv from "dotenv";

// if environment is not production then load environment variables
if (process.env.NODE_ENV !== "production") dotenv.config();

// create instance of express app
const app = express();

const customFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  let metaString = "";
  if (Array.isArray(meta) && meta.length && typeof meta[0] === "object") {
    metaString = meta.map((m) => JSON.stringify(m, null, 2)).join("\n");
  }
  metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : "";
  return `[ ${timestamp} ] [ ${level.toUpperCase()} ] ${message}:\n${metaString}`;
});

// Set up Winston logger (optional, if you want to log to files or handle more complex logging)
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY:MM:dd hh:mm:ss A",
    }),
    customFormat
  ),

  transports: [new winston.transports.Console()],
});

// Use Morgan with a custom stream to log HTTP requests through Winston
app.use(morgan("dev", { stream: { write: (message) => logger.info(message.trim()) } }));

app.get("/", (req, res) => {
  logger.info("Request received in home route");
  logger.info("params", req.params);
  logger.error("query", req.query);
  res.json("Response");
});

app.listen(process.env.PORT, () => {
  console.log("Server is listening on " + process.env.PORT);
});

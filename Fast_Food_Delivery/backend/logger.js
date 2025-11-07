// logger.js
import winston from "winston";
import LokiTransport from "winston-loki";

const logger = winston.createLogger({
  transports: [
    new LokiTransport({
      host: "http://localhost:3100", // hoặc URL Render nếu bạn deploy Loki online
      labels: { app: "fast_food_backend" },
    }),
  ],
  format: winston.format.json(),
});

export default logger;

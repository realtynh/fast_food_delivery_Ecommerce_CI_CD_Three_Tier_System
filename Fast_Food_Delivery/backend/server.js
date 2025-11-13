// server.js
import 'dotenv/config';
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import healthRoute from "./routes/healthRoute.js";

// --- Thêm các phần Observability ---
import client, { httpRequestDuration } from "./prometheus.js";
import logger from "./logger.js";
import "./tracing.js"; // bật OpenTelemetry

// --- App config ---
const app = express();
const port = process.env.PORT || 4000;

// --- Middleware ---
app.use(express.json());
app.use(cors());

// --- Đo độ trễ request ---
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on("finish", () => {
    end({ method: req.method, route: req.path, status_code: res.statusCode });
  });
  next();
});

// --- Logging ---
app.use((req, res, next) => {
  logger.info({
    message: "Request received",
    method: req.method,
    url: req.url,
    time: new Date().toISOString(),
  });
  next();
});

// --- DB connection ---
connectDB();

// --- API endpoints ---
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/health", healthRoute);
app.use('/images', express.static('uploads'));

// --- Root API ---
app.get("/", (req, res) => {
  res.send("API Working with Observability");
});

// --- Route cho Prometheus ---
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

// --- Khởi động server ---
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(` Server started on http://localhost:${port}`);
  });
}

export default app;
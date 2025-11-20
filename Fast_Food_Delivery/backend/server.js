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

// --- Thêm các phần Observability cũ ---
import client, { httpRequestDuration } from "./prometheus.js";
import logger from "./logger.js";
import "./tracing.js"; 

// --- SENTRY IMPORT (NEW) ---
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// --- App config ---
const app = express();
const port = process.env.PORT || 4000;

// --- SENTRY INIT (NEW) ---
// Khởi tạo Sentry ngay sau khi tạo app
Sentry.init({
  dsn: process.env.SENTRY_DSN_BACKEND, // Đảm bảo bạn đã thêm biến này trong .env hoặc Render
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0, 
  profilesSampleRate: 1.0,
});

// --- SENTRY MIDDLEWARE (Request & Tracing) (NEW) ---
// Phải đặt ĐẦU TIÊN, trước tất cả middleware khác
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// --- Middleware cũ ---
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

// --- Test Sentry Route (Optional - để test lỗi) ---
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

// --- Route cho Prometheus ---
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

// --- SENTRY ERROR HANDLER (NEW) ---
// Phải đặt SAU tất cả các routes/controllers nhưng TRƯỚC custom error handler (nếu có) và app.listen
app.use(Sentry.Handlers.errorHandler());

// (Optional) Custom Error Handler của bạn nếu muốn format lại lỗi trả về cho Client
app.use(function onError(err, req, res, next) {
  res.statusCode = 500;
  res.json({ error: err.message, sentryId: res.sentry });
});

// --- Khởi động server ---
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(` Server started on http://localhost:${port}`);
  });
}

export default app;
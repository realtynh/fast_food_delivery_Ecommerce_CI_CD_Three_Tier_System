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

// --- SENTRY IMPORT ---
import "./instrument.js";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// --- App config ---
const app = express();
const port = process.env.PORT || 4000;


// ---------------------------------------------------------
// BỎ QUA HAI DÒNG NÀY (ĐÃ XÓA ĐỂ SỬA LỖI v8)
// app.use(Sentry.Handlers.requestHandler()); <-- XÓA
// app.use(Sentry.Handlers.tracingHandler()); <-- XÓA
// Trong Sentry v8, việc theo dõi request được tự động hóa
// ---------------------------------------------------------

// --- Middleware cũ ---
app.use(express.json());
app.use(cors());

// --- Đo độ trễ request (Prometheus) ---
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

// --- Test Sentry Route ---
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("Sentry V8 Test Error!");
});



// --- Route cho Prometheus ---
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

// --- SENTRY ERROR HANDLER (MỚI CHO v8) ---
// Thay vì dùng app.use(Sentry.Handlers.errorHandler()), ta dùng lệnh này:
Sentry.setupExpressErrorHandler(app);

// (Optional) Custom Error Handler của bạn
// Lưu ý: setupExpressErrorHandler sẽ tự động bắt lỗi trước,
// sau đó mới chuyền xuống đây nếu bạn muốn format lại JSON.
app.use(function onError(err, req, res, next) {
  res.statusCode = 500;
  res.json({ 
      error: err.message, 
      sentryId: Sentry.lastEventId() // Lấy ID lỗi từ Sentry để debug
  });
});

// --- Khởi động server ---
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(` Server started on http://localhost:${port}`);
  });
}

export default app;
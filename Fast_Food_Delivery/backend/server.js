// server.js
import './instrument.js'; // <--- Import file này đầu tiên (để chắc chắn local dev chạy ổn)
import 'dotenv/config';
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import healthRoute from "./routes/healthRoute.js";

// --- Observability ---
import client, { httpRequestDuration } from "./prometheus.js";
import logger from "./logger.js";
import "./tracing.js"; 

// --- SENTRY ---
import * as Sentry from "@sentry/node"; 
// (Không cần nodeProfilingIntegration ở đây nữa)

const app = express();
const port = process.env.PORT || 4000;


// --- Middleware ---
app.use(express.json());
app.use(cors());

// ... (Giữ nguyên các middleware đo thời gian, logging của bạn) ...
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on("finish", () => {
    end({ method: req.method, route: req.path, status_code: res.statusCode });
  });
  next();
});

app.use((req, res, next) => {
  logger.info({
    message: "Request received",
    method: req.method,
    url: req.url,
    time: new Date().toISOString(),
  });
  next();
});

connectDB();

// --- API endpoints ---
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/health", healthRoute);
app.use('/images', express.static('uploads'));

app.get("/", (req, res) => {
  res.send("API Working with Observability");
});

// --- Test Sentry Route ---
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("Sentry V8 Test Error!");
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

// --- SENTRY ERROR HANDLER ---
// Vẫn giữ dòng này để bắt lỗi Express
Sentry.setupExpressErrorHandler(app);

app.use(function onError(err, req, res, next) {
  res.statusCode = 500;
  res.json({ 
      error: err.message, 
      sentryId: Sentry.lastEventId() 
  });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(` Server started on http://localhost:${port}`);
  });
}

export default app;
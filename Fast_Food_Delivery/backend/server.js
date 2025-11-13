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
import * as Sentry from '@sentry/node'
import { httpIntegration } from '@sentry/node';
import { expressIntegration } from '@sentry/node';


// --- App config ---
const app = express();
const port = process.env.PORT || 4000;


Sentry.init({
  dsn: process.env.SENTRY_BACKEND_DSN,
  integrations: [
    httpIntegration({ tracing: true }), 
    expressIntegration({ app }),       
  ],
  tracesSampleRate: 1.0,
});

// 2. Thêm Sentry Request Handler
// Phải đặt TRƯỚC tất cả các router
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
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


// --- Debug Sentry route --- <--- đặt ở đây
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});


// 3. Thêm Sentry Error Handler
// Phải đặt SAU TẤT CẢ router, nhưng TRƯỚC bất kỳ error handler tùy chỉnh nào
app.use(Sentry.Handlers.errorHandler());
// --- Root API ---
app.get("/", (req, res) => {
  res.send("API Working with Observability");
});


// --- Custom Error Handler (Optional) ---
app.use((err, req, res, next) => {
  console.error(err); // Log lỗi ra console
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,

    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});
// --- Khởi động server ---
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(` Server started on http://localhost:${port}`);
  });
}

export default app;

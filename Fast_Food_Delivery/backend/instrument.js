// instrument.js
// import 'dotenv/config'
// import * as Sentry from "@sentry/node";
// import { nodeProfilingIntegration } from "@sentry/profiling-node";

// // Đảm bảo Sentry khởi tạo TRƯỚC KHI bất kỳ thư viện nào khác được import
// Sentry.init({
//   dsn: process.env.SENTRY_BACKEND_DSN,
//   enabled: process.env.NODE_ENV !== 'test',
//   integrations: [
//     nodeProfilingIntegration(),
//   ],
//   tracesSampleRate: 1.0,
//   profilesSampleRate: 1.0,
// });

// instrument.js

// --- QUAN TRỌNG: DÒNG NÀY PHẢI Ở ĐẦU VÀ KHÔNG ĐƯỢC COMMENT ---
import 'dotenv/config'; 
// -------------------------------------------------------------

import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

const isTestEnv = process.env.NODE_ENV === 'test';
const forceEnable = process.env.ENABLE_SENTRY_TEST === 'true';

// Debug để chắc chắn DSN đã nhận
console.log("Sentry DSN Status:", process.env.SENTRY_BACKEND_DSN ? "Loaded ✅" : "Missing ❌");

Sentry.init({
  dsn: process.env.SENTRY_BACKEND_DSN,
  enabled: !isTestEnv || forceEnable, 
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});
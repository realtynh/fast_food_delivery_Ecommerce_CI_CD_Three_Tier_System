// instrument.js
import 'dotenv/config'; 
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

const isTest = process.env.NODE_ENV === 'test';
const isCI = process.env.CI === 'true'; // Kiểm tra biến môi trường CI

console.log('SENTRY_BACKEND_DSN length:', process.env.SENTRY_BACKEND_DSN ? process.env.SENTRY_BACKEND_DSN.length : 0);

Sentry.init({
  dsn: process.env.SENTRY_BACKEND_DSN,
  integrations: [
    nodeProfilingIntegration(),
  ],
  // Logic: Tắt Sentry khi chạy test Local, NHƯNG BẬT nếu đang chạy trong CI (GitHub Actions)
  enabled: !isTest || isCI, 
  tracesSampleRate: 1.0, 
});
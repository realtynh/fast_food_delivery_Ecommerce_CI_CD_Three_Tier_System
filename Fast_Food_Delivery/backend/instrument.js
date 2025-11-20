// instrument.js
import 'dotenv/config'; // <--- QUAN TRỌNG: Phải load biến môi trường đầu tiên
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

const isTest = process.env.NODE_ENV === 'test';

Sentry.init({
  dsn: process.env.SENTRY_BACKEND_DSN,
  integrations: [
    nodeProfilingIntegration(),
  ],
  // Tắt Sentry khi chạy test để tránh spam, trừ khi muốn debug test
  enabled: TRUE, 
  tracesSampleRate: 1.0, 
});
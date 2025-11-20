// instrument.js
import 'dotenv/config'; 
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

const isTest = process.env.NODE_ENV === 'test';
const isCI = process.env.CI === 'true';

console.log('SENTRY_BACKEND_DSN length:', process.env.SENTRY_BACKEND_DSN ? process.env.SENTRY_BACKEND_DSN.length : 0);

// --- QUAN TRỌNG: LỌC INTEGRATIONS ---
// Chúng ta KHÔNG nạp Profiling khi chạy Test để tránh lỗi "Maximum call stack size exceeded"
// do xung đột giữa Jest Proxy và Sentry Wrapper.
const integrations = [];

if (!isTest) {
  // Chỉ bật Profiling khi chạy Production hoặc Dev (không phải Test)
  integrations.push(nodeProfilingIntegration());
}

Sentry.init({
  dsn: process.env.SENTRY_BACKEND_DSN,
  
  // Sử dụng danh sách integrations đã lọc
  integrations: integrations,

  // Logic bật tắt:
  // - Local Test: Tắt (để không spam)
  // - CI/CD Test: Bật (để bắt lỗi)
  // - Production: Bật
  enabled: !isTest || isCI, 
  
  tracesSampleRate: 1.0, 
});
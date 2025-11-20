// instrument.js
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// Đảm bảo Sentry khởi tạo TRƯỚC KHI bất kỳ thư viện nào khác được import
Sentry.init({
  dsn: process.env.SENTRY_BACKEND_DSN,
  enabled: process.env.NODE_ENV !== 'test',
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});
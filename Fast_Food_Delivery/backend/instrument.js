// instrument.js
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// Logic: Tắt ở test, TRỪ KHI có biến ENABLE_SENTRY_TEST=true
const isTestEnv = process.env.NODE_ENV === 'test';
const forceEnable = process.env.ENABLE_SENTRY_TEST === 'true';

Sentry.init({
  dsn: process.env.SENTRY_BACKEND_DSN,
  
  // SỬA DÒNG NÀY:
  enabled: !isTestEnv || forceEnable, 

  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});
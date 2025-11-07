// prometheus.js
import client from "prom-client";

// Thu thập các metrics mặc định (CPU, memory, event loop, GC, v.v.)
client.collectDefaultMetrics();

// Metric đo thời gian phản hồi request
export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_ms",
  help: "Thời gian phản hồi (ms)",
  labelNames: ["method", "route", "status_code"],
  buckets: [50, 100, 200, 300, 500, 1000, 2000],
});

export default client;

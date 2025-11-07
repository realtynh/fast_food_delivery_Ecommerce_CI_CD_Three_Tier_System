// tracing.js
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

const traceExporter = new OTLPTraceExporter({
  url: "http://localhost:4318/v1/traces", // Tempo endpoint (local)
});

const sdk = new NodeSDK({
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
console.log("✅ OpenTelemetry tracing started");

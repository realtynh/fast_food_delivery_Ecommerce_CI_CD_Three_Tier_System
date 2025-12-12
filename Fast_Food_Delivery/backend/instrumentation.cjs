/* instrumentation.cjs - FIXED & CLEAN */
const { ConsoleMetricExporter } = require('@opentelemetry/sdk-metrics');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-grpc');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-grpc');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { SimpleLogRecordProcessor } = require('@opentelemetry/sdk-logs');
const { Metadata } = require('@grpc/grpc-js');

// 1. CẤU HÌNH MẶC ĐỊNH (Localhost -> Alloy)
const LOCAL_URL = 'http://localhost:4317';

// Khởi tạo các Exporter trỏ về Alloy trước
let traceExporter = new OTLPTraceExporter({ url: LOCAL_URL });
let metricExporter = new OTLPMetricExporter({ url: LOCAL_URL });
let logExporter = new OTLPLogExporter({ url: LOCAL_URL });

// 2. LOGIC CHO GITHUB ACTIONS (CI/CD) - Chỉ ghi đè khi cần thiết
if (process.env.CI === 'true') {
  console.log('🚀 Detected CI Environment. Adjusting for Grafana Cloud...');
  
  const TEMPO_USER_ID = process.env.TEMPO_USER_ID; 
  const API_KEY = process.env.GRAFANA_CLOUD_API_KEY;
  const TEMPO_ENDPOINT = process.env.TEMPO_ENDPOINT || 'https://tempo-prod-10-prod-ap-southeast-1.grafana.net:443';

  if (TEMPO_USER_ID && API_KEY) {
    const metadata = new Metadata();
    const auth = Buffer.from(`${TEMPO_USER_ID}:${API_KEY}`).toString('base64');
    metadata.set('Authorization', 'Basic ' + auth);

    // Ghi đè Trace Exporter để bắn thẳng lên Cloud (Bỏ qua Alloy vì trên CI không có Alloy)
    traceExporter = new OTLPTraceExporter({ 
      url: TEMPO_ENDPOINT, 
      metadata: metadata 
    });
    console.log('✅ Configured Direct Cloud Tracing for CI.');
  } else {
    console.warn('⚠️ Missing Secrets on CI. Tracing might fail.');
  }
}

// 3. KHỞI TẠO SDK (Chỉ khai báo 1 lần duy nhất cho mỗi thành phần)
const sdk = new NodeSDK({
  serviceName: 'fast-food-backend',
  
  // --- Traces ---
  traceExporter: traceExporter,

  // --- Metrics (SỬA LỖI: Chỉ giữ lại 1 cái này thôi) ---
  metricReader: new PeriodicExportingMetricReader({
  // Sửa dòng này: Dùng ConsoleMetricExporter để in ra màn hình
  exporter: new ConsoleMetricExporter(), 
  exportIntervalMillis: 5000, 
}),

  // --- Logs ---
  logRecordProcessor: new SimpleLogRecordProcessor(logExporter),

  // --- Auto Instrumentation ---
  instrumentations: [getNodeAutoInstrumentations()],
});

// 4. BẮT ĐẦU GIÁM SÁT
sdk.start();

console.log('✅ Full Observability Started (Traces, Metrics, Logs)');

// Graceful Shutdown
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Observability terminated'))
    .finally(() => process.exit(0));
}); 
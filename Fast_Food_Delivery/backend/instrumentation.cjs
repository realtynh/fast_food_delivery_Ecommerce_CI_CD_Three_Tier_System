// instrumentation.cjs - PHIÊN BẢN FULL (Traces + Metrics + Logs)
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-grpc');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { Metadata } = require('@grpc/grpc-js');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');

// Bật log debug nếu cần soi lỗi kết nối (tùy chọn)
// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// Cấu hình mặc định (Localhost -> Alloy)
const OTLP_OPTIONS = {
  url: 'http://localhost:4317', // Cổng gRPC của Alloy
};

let traceExporter = new OTLPTraceExporter(OTLP_OPTIONS);
let metricExporter = new OTLPMetricExporter(OTLP_OPTIONS);

// LOGIC CHO GITHUB ACTIONS (CI/CD)
if (process.env.CI === 'true') {
  console.log('🚀 Chạy trên CI: Gửi thẳng lên Grafana Cloud');
  
  const TEMPO_USER_ID = process.env.TEMPO_USER_ID; 
  const PROM_USER_ID = process.env.PROM_USER_ID; // Cần thêm Secret này trên GitHub
  const API_KEY = process.env.GRAFANA_CLOUD_API_KEY;
  
  // URL Endpoint (Lấy từ Grafana Cloud Portal)
  const TEMPO_URL = process.env.TEMPO_ENDPOINT || 'https://tempo-prod-10-prod-ap-southeast-1.grafana.net:443';
  const PROM_URL = process.env.PROM_ENDPOINT || 'https://prometheus-prod-37-prod-ap-southeast-1.grafana.net:443';

  if (API_KEY) {
    const metadata = new Metadata();
    // Auth header chung (Lưu ý: Basic Auth cần UserID tương ứng cho từng dịch vụ)
    // Để đơn giản trên CI, ta ưu tiên Traces. Metrics trên CI thường ít quan trọng hơn.
    const auth = Buffer.from(`${TEMPO_USER_ID}:${API_KEY}`).toString('base64');
    metadata.set('Authorization', 'Basic ' + auth);

    traceExporter = new OTLPTraceExporter({ url: TEMPO_URL, metadata });
    // Nếu muốn gửi Metrics từ CI, cần tạo thêm exporter riêng với PROM_USER_ID
  }
}

const sdk = new NodeSDK({
  serviceName: 'fast-food-backend',
  
  // 1. TRACES (Đã có)
  traceExporter: traceExporter,
  
  // 2. METRICS (Mới thêm) - Gửi thống kê mỗi 5 giây
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 5000, 
  }),

  // Tự động đo đạc Express, Http, Mongoose...
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .finally(() => process.exit(0));
});
// instrumentation.js
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { Metadata } = require('@grpc/grpc-js');

// Cấu hình mặc định: Chạy Local (Gửi về Alloy)
let traceExporterConfig = {
  url: 'http://localhost:4317', // Alloy đang lắng nghe ở đây
};

// LOGIC THÔNG MINH: Kiểm tra xem có đang chạy trên GitHub Actions không?
// Biến môi trường "CI" luôn được GitHub set là "true"
if (process.env.CI === 'true') {
  console.log('🚀 Đang chạy trên CI/CD Environment (GitHub Actions)');
  
  // 1. Lấy thông tin xác thực từ biến môi trường (Secrets)
  const TEMPO_USER_ID = process.env.TEMPO_USER_ID; 
  const API_KEY = process.env.GRAFANA_CLOUD_API_KEY;
  const TEMPO_ENDPOINT = process.env.TEMPO_ENDPOINT || 'https://tempo-prod-10-prod-ap-southeast-1.grafana.net:443'; 
  // (Lưu ý: Endpoint trên phải đúng với region của account bạn, xem trong Portal)

  if (TEMPO_USER_ID && API_KEY) {
    // 2. Tạo Header xác thực
    const metadata = new Metadata();
    const auth = Buffer.from(`${TEMPO_USER_ID}:${API_KEY}`).toString('base64');
    metadata.set('Authorization', 'Basic ' + auth);

    // 3. Cấu hình lại để bắn thẳng lên Cloud
    traceExporterConfig = {
      url: TEMPO_ENDPOINT,
      metadata: metadata,
    };
  } else {
    console.warn('⚠️ Thiếu TEMPO_USER_ID hoặc API KEY, không thể gửi Traces lên Cloud.');
  }
}

const sdk = new NodeSDK({
  serviceName: process.env.SERVICE_NAME || 'fast-food-backend', // Tên hiển thị trên Grafana
  traceExporter: new OTLPTraceExporter(traceExporterConfig),
  instrumentations: [getNodeAutoInstrumentations()], // Tự động bắt HTTP, Express, Mongo...
});

sdk.start();

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
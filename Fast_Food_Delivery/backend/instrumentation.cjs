// instrumentation.cjs - PHIÊN BẢN FULL (ĐÃ SỬA LỖI)
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-grpc');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-grpc');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { SimpleLogRecordProcessor } = require('@opentelemetry/sdk-logs');
const { Metadata } = require('@grpc/grpc-js');

// 1. KHỞI TẠO MẶC ĐỊNH CHO LOCALHOST (Kết nối với Alloy)
const LOCAL_URL = 'http://localhost:4317';

let traceExporter = new OTLPTraceExporter({ url: LOCAL_URL });
let metricExporter = new OTLPMetricExporter({ url: LOCAL_URL });
let logExporter = new OTLPLogExporter({ url: LOCAL_URL });

// 2. LOGIC XỬ LÝ KHI CHẠY TRÊN GITHUB ACTIONS (CI/CD)
// Nếu phát hiện đang chạy trên CI, ta sẽ ghi đè cấu hình để bắn thẳng lên Cloud
if (process.env.CI === 'true') {
  console.log('🚀 Chạy trên CI: Đang cấu hình gửi trực tiếp lên Grafana Cloud...');
  
  const TEMPO_USER_ID = process.env.TEMPO_USER_ID; 
  const API_KEY = process.env.GRAFANA_CLOUD_API_KEY;
  
  // URL Endpoint (Lấy từ Grafana Cloud Portal - Tempo)
  // Lưu ý: Trên CI chủ yếu cần Traces để debug lỗi test.
  const TEMPO_URL = process.env.TEMPO_ENDPOINT || 'https://tempo-prod-10-prod-ap-southeast-1.grafana.net:443';

  if (TEMPO_USER_ID && API_KEY) {
    const metadata = new Metadata();
    // Tạo Auth Header: Basic base64(UserID:ApiKey)
    const auth = Buffer.from(`${TEMPO_USER_ID}:${API_KEY}`).toString('base64');
    metadata.set('Authorization', 'Basic ' + auth);

    // Ghi đè traceExporter để dùng cấu hình Cloud
    traceExporter = new OTLPTraceExporter({ 
      url: TEMPO_URL, 
      metadata: metadata 
    });
    
    // Lưu ý: Metrics và Logs trên CI thường ít quan trọng hơn Traces nên ta giữ nguyên hoặc bỏ qua để tránh phức tạp auth.
    console.log('✅ Đã cập nhật cấu hình Traces cho CI/CD.');
  } else {
    console.warn('⚠️ Đang chạy trên CI nhưng thiếu TEMPO_USER_ID hoặc API_KEY. Traces sẽ không được gửi.');
  }
}

// 3. KHỞI TẠO SDK (Sử dụng các biến exporter đã xử lý ở trên)
const sdk = new NodeSDK({
  serviceName: 'fast-food-backend',
  
  // Sử dụng biến traceExporter (đã được tự động chọn Local hoặc Cloud ở trên)
  traceExporter: traceExporter,
  
  // Metrics (Gửi mỗi 5 giây)
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 5000, 
  }),

  // Logs
  logRecordProcessor: new SimpleLogRecordProcessor(logExporter),

  // Tự động đo đạc
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

console.log('✅ Hệ thống giám sát (Observability) đã khởi động.');

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .finally(() => process.exit(0));
});
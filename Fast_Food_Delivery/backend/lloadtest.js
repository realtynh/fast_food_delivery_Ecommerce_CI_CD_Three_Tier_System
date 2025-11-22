// import http from 'k6/http';
// import { sleep, check } from 'k6';

// // Cấu hình kịch bản
// export const options = {
//   // Giai đoạn chạy test
//   stages: [
//     { duration: '10s', target: 20 }, // Tăng dần lên 20 users trong 10s đầu (Ramp up)
//     { duration: '30s', target: 100 }, // Duy trì 50 users trong 30s tiếp theo (Load)
//     { duration: '10s', target: 0 },  // Giảm dần về 0 users (Ramp down)
//   ],
//   // Tiêu chuẩn để coi là test đạt (Thresholds)
//   thresholds: {
//     http_req_duration: ['p(95)<500'], // 95% số request phải phản hồi dưới 500ms
//     http_req_failed: ['rate<0.01'], // Tỷ lệ lỗi phải dưới 1%
//   },
// };

// export default function () {
//   // Giả lập gọi API lấy danh sách sản phẩm
//   const res = http.get('http://localhost:4000/api/food/list');

//   // Kiểm tra xem API có trả về 200 OK không
//   check(res, { 'status was 200': (r) => r.status == 200 });

//   sleep(1); // Mỗi user nghỉ 1s rồi mới gọi tiếp (mô phỏng hành vi người thật)
// }
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // Cấu hình chạy đúng 100 lần đăng ký rồi dừng
  scenarios: {
    registration_test: {
      executor: 'shared-iterations',
      vus: 10,            // Dùng 10 người dùng ảo cùng lúc
      iterations: 50,    // Tổng cộng thực hiện 100 lần đăng ký
      maxDuration: '1m',  // Giới hạn thời gian tối đa 1 phút
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'], // Tỷ lệ lỗi phải dưới 1%
    http_req_duration: ['p(95)<5000'], // 95% request phải nhanh hơn 500ms
  },
};

export default function () {
  // 1. Tạo email ngẫu nhiên để không bị trùng
  // Date.now() lấy thời gian hiện tại (ms), đảm bảo luôn khác nhau
  const randomString = Date.now().toString() + Math.random().toString(36).substring(7);
  const uniqueEmail = `user_${randomString}@test.com`;

  // 2. Chuẩn bị dữ liệu (Payload)
  // LƯU Ý: Hãy sửa các trường name, email, password cho khớp với Backend của bạn
  const payload = JSON.stringify({
    name: "Test User",
    email: uniqueEmail, 
    password: "Password123@", 
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // 3. Gửi Request (SỬA URL CHO ĐÚNG SERVER CỦA BẠN)
  // Ví dụ: http://localhost:5000/api/users/register
  const res = http.post('http://localhost:4000/api/user/register', payload, params);

  // 4. Kiểm tra kết quả
  check(res, {
    'Đăng ký thành công (200/201)': (r) => r.status === 200 || r.status === 201,
    'Không bị lỗi trùng email': (r) => r.status !== 409, // 409 thường là lỗi Conflict/Duplicate
  });

  // Nghỉ 1 xíu giữa các lần gửi để không spam quá gắt (tùy chọn)
  sleep(1);
}
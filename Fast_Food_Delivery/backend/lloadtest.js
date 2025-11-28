import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    flow_register_login: {
      // Dùng executor này để đảm bảo chạy ĐÚNG 100 lần rồi dừng
      executor: 'shared-iterations',
      
      // Số lượng user ảo chạy song song (ví dụ 10 người cùng làm việc này)
      vus: 10,
      
      // TỔNG số lượng user cần tạo (theo yêu cầu của bạn là 100)
      iterations: 100,
      
      // Thời gian tối đa cho phép test chạy (phòng khi mạng chậm)
      maxDuration: '5m',
    },
  },
  thresholds: {
    // Cảnh báo nếu có request nào bị lỗi (tỉ lệ lỗi > 0%)
    http_req_failed: ['rate==0'], 
  },
};

// Cấu hình URL gốc (thay đổi port nếu backend của bạn khác)
const BASE_URL = 'https://fast-food-delivery-ecommerce-ci-cd-three.onrender.com/api/user';

export default function () {
  // --- BƯỚC 1: TẠO DỮ LIỆU DUY NHẤT ---
  // Kết hợp thời gian + số ngẫu nhiên để đảm bảo email không bao giờ trùng
  const uniqueId = Date.now().toString() + Math.random().toString(36).substring(2, 7);
  
  const userData = {
    name: `User ${uniqueId}`,
    email: `user_${uniqueId}@test.com`,
    password: "Password123@", // Mật khẩu thống nhất
    phone: "0987654321"
  };

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  // --- BƯỚC 2: GỬI REQUEST ĐĂNG KÝ (REGISTER) ---
  const regRes = http.post(`${BASE_URL}/register`, JSON.stringify(userData), params);

  // Kiểm tra đăng ký có thành công không
  const isRegSuccess = check(regRes, {
    '1. Register thành công (200/201)': (r) => r.status === 200 || r.status === 201,
  });

  // --- BƯỚC 3: GỬI REQUEST ĐĂNG NHẬP (LOGIN) ---
  // Chỉ thực hiện đăng nhập nếu đăng ký thành công để tránh lỗi dây chuyền
  if (isRegSuccess) {
    const loginPayload = JSON.stringify({
      email: userData.email,
      password: userData.password,
    });

    const loginRes = http.post(`${BASE_URL}/login`, loginPayload, params);

    check(loginRes, {
      '2. Login thành công (200)': (r) => r.status === 200,
      '   -> Có Token': (r) => r.json('token') !== undefined || r.json('accessToken') !== undefined,
    });
  } else {
    // In ra lỗi nếu đăng ký thất bại để debug
    console.error(`Đăng ký lỗi [${userData.email}]: ${regRes.status} - ${regRes.body}`);
  }

  // Nghỉ ngẫu nhiên từ 0.5s đến 1s để giả lập hành vi người dùng thật
  sleep(Math.random() * 0.5 + 0.5);
}
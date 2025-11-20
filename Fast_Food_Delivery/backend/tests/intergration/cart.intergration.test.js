import request from 'supertest';
import app from '../../server.js';
import userModel from '../../models/userModel.js';

// Mock userModel để không chạm vào Database thật
jest.mock('../../models/userModel.js');

// Mock authMiddleware để bypass xác thực (luôn cho qua)
jest.mock('../../middleware/auth.js', () => (req, res, next) => next());

describe('Cart API Integration', () => {
  // Reset các mock sau mỗi test để không bị chồng chéo dữ liệu
  afterEach(() => jest.clearAllMocks());

  // --- TEST 1: Thêm vào giỏ hàng ---
  it('POST /api/cart/add should add item to cart', async () => {
    const cartData = {};
    userModel.findById.mockResolvedValue({ cartData });
    userModel.findByIdAndUpdate.mockResolvedValue({});

    const res = await request(app)
      .post('/api/cart/add')
      .send({ userId: 'user123', itemId: 'item1' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true, message: 'Added to Cart' });
  });

  // --- TEST 2: Xóa khỏi giỏ hàng ---
  it('POST /api/cart/remove should remove item from cart', async () => {
    const cartData = { item1: 2 };
    userModel.findById.mockResolvedValue({ cartData });
    userModel.findByIdAndUpdate.mockResolvedValue({});

    const res = await request(app)
      .post('/api/cart/remove')
      .send({ userId: 'user123', itemId: 'item1' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true, message: 'Removed from Cart' });
  });

  // --- TEST 3: Lấy dữ liệu giỏ hàng ---
  it('POST /api/cart/get should return cart data', async () => {
    const cartData = { item1: 1 };
    userModel.findById.mockResolvedValue({ cartData });

    const res = await request(app)
      .post('/api/cart/get')
      .send({ userId: 'user123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true, cartData });
  });

  // --- TEST 4: KIỂM TRA XỬ LÝ LỖI (VÀ KÍCH HOẠT SENTRY) ---
  it('POST /api/cart/add should return 500 when database fails', async () => {
    // 1. Giả lập lỗi Database
    const fakeError = new Error("Sentry Test: Database Connection Failed!");
    userModel.findById.mockRejectedValue(fakeError);

    // 2. Gọi API
    const res = await request(app)
      .post('/api/cart/add')
      .send({ userId: 'user123', itemId: 'item1' });

    // 3. Khẳng định (Assert)
    // Test này sẽ PASS (Màu xanh) nếu server trả về lỗi 500 đúng như mong đợi
    expect(res.statusCode).toBe(500); 
    expect(res.body.success).toBe(false);
    
    // (Tùy chọn) Kiểm tra xem message lỗi có được trả về không
    // expect(res.body.message).toBeDefined(); 
  });

});
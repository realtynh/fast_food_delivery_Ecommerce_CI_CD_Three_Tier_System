import "../../instrument.js";
import request from 'supertest';
import app from '../../server.js';
import userModel from '../../models/userModel.js';
import * as Sentry from "@sentry/node";

jest.mock('../../models/userModel.js');

// Mock authMiddleware để bypass xác thực
jest.mock('../../middleware/auth.js', () => (req, res, next) => next());

describe('Cart API Integration', () => {
  afterEach(() => jest.clearAllMocks());

//  Chờ Sentry gửi dữ liệu trước khi tắt Jest
  afterAll(async () => {
    await Sentry.close(2000); // Chờ tối đa 2 giây
  });
// --------------------------------------------------------
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

  it('POST /api/cart/get should return cart data', async () => {
    const cartData = { item1: 1 };
    userModel.findById.mockResolvedValue({ cartData });

    const res = await request(app)
      .post('/api/cart/get')
      .send({ userId: 'user123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true, cartData });
  });

  // --- TEST CASE GÂY LỖI CHO SENTRY ---
  it('POST /api/cart/add should trigger Sentry when Database fails', async () => {
    // 1. Giả lập lỗi: Khi gọi findById thì ném lỗi Database ra
    const fakeError = new Error("Sentry Test: Database Connection Failed!");
    userModel.findById.mockRejectedValue(fakeError);

    // 2. Gọi API
    const res = await request(app)
      .post('/api/cart/add')
      .send({ userId: 'user123', itemId: 'item1' });

    // 3. Log ra để xem Controller của bạn xử lý lỗi thế nào
    console.log("Response status:", res.statusCode);
    
    // Lưu ý: 
    // - Nếu Controller bạn dùng try/catch và res.json({success: false}) -> Test này vẫn Pass nhưng Sentry CÓ THỂ KHÔNG BẮT (nếu bạn không Sentry.captureException).
    // - Nếu Controller bạn dùng next(error) -> Test này sẽ trả về 500 -> Sentry BẮT NGAY.
  });

});

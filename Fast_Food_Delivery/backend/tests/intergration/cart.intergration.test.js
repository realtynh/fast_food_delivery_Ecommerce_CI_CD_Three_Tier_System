import request from 'supertest';
import app from '../../server.js';
import userModel from '../../models/userModel.js';

jest.setTimeout(30000);

jest.mock('../../models/userModel.js');

// Mock authMiddleware để bypass xác thực
jest.mock('../../middleware/auth.js', () => (req, res, next) => next());

describe('Cart API Integration', () => {
  afterEach(() => jest.clearAllMocks());

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
});

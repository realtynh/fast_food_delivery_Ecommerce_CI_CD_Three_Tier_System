import "../../instrument.js";
import { addToCart, removeFromCart, getCart } from '../../controllers/cartController.js';
import userModel from '../../models/userModel.js';
import * as Sentry from "@sentry/node";

jest.mock('../../models/userModel.js');

const mockReq = (body = {}) => ({ body });
const mockRes = () => {
  const res = {};
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Cart Controller - Unit Tests', () => {
  afterEach(() => jest.clearAllMocks());

  describe('addToCart', () => {
    it('should add item to cart', async () => {
      const cartData = {};
      userModel.findById.mockResolvedValue({ cartData });
      userModel.findByIdAndUpdate.mockResolvedValue({});

      const req = mockReq({ userId: 'user123', itemId: 'item1' });
      const res = mockRes();

      await addToCart(req, res);
      expect(cartData['item1']).toBe(1);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Added to Cart' });
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      const cartData = { item1: 2 };
      userModel.findById.mockResolvedValue({ cartData });
      userModel.findByIdAndUpdate.mockResolvedValue({});

      const req = mockReq({ userId: 'user123', itemId: 'item1' });
      const res = mockRes();

      await removeFromCart(req, res);
      expect(cartData['item1']).toBe(1);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Removed from Cart' });
    });
  });

  describe('getCart', () => {
    it('should return user cart', async () => {
      const cartData = { item1: 1 };
      userModel.findById.mockResolvedValue({ cartData });

      const req = mockReq({ userId: 'user123' });
      const res = mockRes();

      await getCart(req, res);
      expect(res.json).toHaveBeenCalledWith({ success: true, cartData });
    });
  });
});

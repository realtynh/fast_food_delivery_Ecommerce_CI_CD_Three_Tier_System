// tests/unit/order.controller.test.js
// import "../../instrument.js";
import { placeOrder, verifyOrder, userOrders, listOrders, updateStatus } from '../../controllers/orderController.js';
import orderModel from '../../models/orderModel.js';
import userModel from '../../models/userModel.js';
// import * as Sentry from "@sentry/node";

// -----------------------------
//  Mock Models
// -----------------------------
jest.mock('../../models/orderModel.js');
jest.mock('../../models/userModel.js');

// -----------------------------
//  Mock Stripe inline (no external variables)
// -----------------------------
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({ url: 'session_url' })
      }
    }
  }));
});

// -----------------------------
//  Helpers
// -----------------------------
const mockReq = (body = {}) => ({ body });
const mockRes = () => {
  const res = {};
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Set STRIPE_SECRET_KEY để controller không lỗi
process.env.STRIPE_SECRET_KEY = 'test_key';

// -----------------------------
//  Unit Tests
// -----------------------------
describe('Order Controller - Unit Tests', () => {
  afterEach(() => jest.clearAllMocks());

  // -------------------------------
  describe('placeOrder', () => {
    it('should place order and return session url', async () => {
      const req = mockReq({
        userId: 'user123',
        items: [{ name: 'Pizza', price: 100, quantity: 2 }],
        amount: 200,
        address: 'Address'
      });
      const res = mockRes();

      // Mock new order object + save()
      orderModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({ _id: 'order123' })
      }));

      // Mock update user cart
      userModel.findByIdAndUpdate.mockResolvedValue({});

      await placeOrder(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        session_url: 'session_url'
      });
    });
  });

  // -------------------------------
  describe('verifyOrder', () => {
    it('marks order as paid if success=true', async () => {
      const req = mockReq({ orderId: 'order123', success: 'true' });
      const res = mockRes();

      orderModel.findByIdAndUpdate.mockResolvedValue({});

      await verifyOrder(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Paid'
      });
    });

    it('deletes order if success=false', async () => {
      const req = mockReq({ orderId: 'order123', success: 'false' });
      const res = mockRes();

      orderModel.findByIdAndDelete.mockResolvedValue({});

      await verifyOrder(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not Paid'
      });
    });
  });

  // -------------------------------
  describe('userOrders', () => {
    it('returns user orders', async () => {
      const req = mockReq({ userId: 'user123' });
      const res = mockRes();

      orderModel.find.mockResolvedValue([{ _id: 'order1' }, { _id: 'order2' }]);

      await userOrders(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [{ _id: 'order1' }, { _id: 'order2' }]
      });
    });
  });

  // -------------------------------
  describe('listOrders', () => {
    it('returns all orders', async () => {
      const req = mockReq();
      const res = mockRes();

      orderModel.find.mockResolvedValue([{ _id: 'order1' }, { _id: 'order2' }]);

      await listOrders(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [{ _id: 'order1' }, { _id: 'order2' }]
      });
    });
  });

  // -------------------------------
  describe('updateStatus', () => {
    it('updates order status', async () => {
      const req = mockReq({ orderId: 'order123', status: 'Delivered' });
      const res = mockRes();

      orderModel.findByIdAndUpdate.mockResolvedValue({});

      await updateStatus(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Status Updated'
      });
    });
  });
});

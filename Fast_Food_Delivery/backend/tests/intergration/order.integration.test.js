import "../../instrument.js";
import orderModel from "../../models/orderModel.js";
import userModel from "../../models/userModel.js";
import { placeOrder, verifyOrder, userOrders, listOrders, updateStatus } from "../../controllers/orderController.js";

// Mock response object
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Mock request object
const mockReq = (body = {}, user = {}) => ({
  body,
  user,
});

// -----------------------------
// Mock Models
// -----------------------------
jest.mock("../../models/orderModel.js");
jest.mock("../../models/userModel.js");

// -----------------------------
// Mock Stripe INLINE (không dùng biến ngoài scope)
// -----------------------------
jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({ url: "session_url" }),
      },
    },
  }));
});

// -----------------------------
// Tests
// -----------------------------
describe("Order Controller - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // placeOrder
  it("placeOrder should place order and return session url", async () => {
    const req = mockReq({
      userId: "user123",
      items: [{ name: "Pizza", price: 100, quantity: 2 }],
      amount: 200,
      address: "Address",
    });
    const res = mockRes();

    orderModel.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({ _id: "order123" }),
    }));

    userModel.findByIdAndUpdate.mockResolvedValue({});

    await placeOrder(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      session_url: "session_url",
    });
  });

  it("placeOrder should return error if save fails", async () => {
    const req = mockReq({ userId: "user123", items: [], amount: 0, address: "" });
    const res = mockRes();

    orderModel.mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(new Error("fail")),
    }));

    await placeOrder(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Error",
    });
  });

  // verifyOrder
  it("verifyOrder should mark paid if success=true", async () => {
    const req = mockReq({ orderId: "order123", success: "true" });
    const res = mockRes();

    orderModel.findByIdAndUpdate.mockResolvedValue({});

    await verifyOrder(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Paid",
    });
  });

  it("verifyOrder should delete order if success=false", async () => {
    const req = mockReq({ orderId: "order123", success: "false" });
    const res = mockRes();

    orderModel.findByIdAndDelete.mockResolvedValue({});

    await verifyOrder(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Not Paid",
    });
  });

  // userOrders
  it("userOrders should return user orders", async () => {
    const req = mockReq({ userId: "user123" });
    const res = mockRes();

    orderModel.find.mockResolvedValue([{ _id: "order1" }, { _id: "order2" }]);

    await userOrders(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ _id: "order1" }, { _id: "order2" }],
    });
  });

  // listOrders
  it("listOrders should return all orders", async () => {
    const req = mockReq();
    const res = mockRes();

    orderModel.find.mockResolvedValue([{ _id: "order1" }, { _id: "order2" }]);

    await listOrders(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ _id: "order1" }, { _id: "order2" }],
    });
  });

  // updateStatus
  it("updateStatus should update order status", async () => {
    const req = mockReq({ orderId: "order123", status: "Delivered" });
    const res = mockRes();

    orderModel.findByIdAndUpdate.mockResolvedValue({});

    await updateStatus(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Status Updated",
    });
  });
});

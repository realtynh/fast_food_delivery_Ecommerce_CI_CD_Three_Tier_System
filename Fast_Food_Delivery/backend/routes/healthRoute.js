import express from "express";

const healthRoute = express.Router();

healthRoute.get('/',(req,res) => {
    const healthCheck = {
    uptime: process.uptime(), // Thời gian server đã chạy (tính bằng giây)
    message: 'OK',
    timestamp: Date.now()
  };
  try {
    // Trả về mã trạng thái 200 (OK) và một đối tượng JSON
    res.status(200).json(healthCheck);
  } catch (error) {
    // Nếu có lỗi, trả về mã 503 (Service Unavailable)
    healthCheck.message = error;
    res.status(503).send();
  }
});

export default healthRoute
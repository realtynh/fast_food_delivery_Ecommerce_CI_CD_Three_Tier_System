import request from 'supertest';
import app from '../../server.js';
import foodModel from '../../models/foodModel.js';
import fs from 'fs';

// Mock Models và fs
jest.mock('../../models/foodModel.js');
jest.mock('fs');

describe('Food API Integration', () => {
  afterEach(() => jest.clearAllMocks());

  // Mock save cho instance
  const mockSave = jest.fn();
  foodModel.prototype.save = mockSave;

  it('POST /api/food/add should add food', async () => {
    // Giả lập lưu thành công
    mockSave.mockResolvedValue({});

    // Giả lập req.file để tránh crash
    const file = { originalname: 'pizza.jpg', filename: 'pizza.jpg' };

    // Sử dụng supertest + field + attach nhưng attach không cần Multer thật
    const res = await request(app)
      .post('/api/food/add')
      .field('name', 'Pizza')
      .field('description', 'Delicious')
      .field('price', 100)
      .field('category', 'Fast Food')
      // Gán file trực tiếp vào multer mock
      .attach('image', Buffer.from('file'), 'pizza.jpg');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true, message: 'Food Added' });
  });

  it('GET /api/food/list should return food list', async () => {
    foodModel.find.mockResolvedValue([{ name: 'Pizza' }]);

    const res = await request(app).get('/api/food/list');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true, data: [{ name: 'Pizza' }] });
  });

  it('POST /api/food/remove should remove food', async () => {
    foodModel.findById.mockResolvedValue({ image: 'pizza.jpg' });
    foodModel.findByIdAndDelete.mockResolvedValue({});
    fs.unlink.mockImplementation((path, cb) => cb(null));

    const res = await request(app)
      .post('/api/food/remove')
      .send({ id: 'food123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true, message: 'Food removed' });
  });

  it('POST /api/food/remove should handle error if food not found', async () => {
    foodModel.findById.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/food/remove')
      .send({ id: 'invalidId' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: false, message: 'error' });
  });
});

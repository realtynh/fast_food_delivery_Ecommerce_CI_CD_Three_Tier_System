import "../../instrument.js";
import { addFood, listFood, removeFood } from '../../controllers/foodController.js';
import foodModel from '../../models/foodModel.js';
import fs from 'fs';
import * as Sentry from "@sentry/node";

jest.mock('../../models/foodModel.js');
jest.mock('fs');

const mockReq = (body = {}, file = null) => ({ body, file });
const mockRes = () => {
  const res = {};
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Food Controller - Unit Tests', () => {
  afterEach(() => jest.clearAllMocks());

  describe('addFood', () => {
    it('should add food item successfully', async () => {
      const req = mockReq({
        name: 'Pizza',
        description: 'Delicious',
        price: 100,
        category: 'Fast Food'
      }, { filename: 'pizza.jpg' });
      const res = mockRes();

      // Mock constructor + save method
      foodModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({})
      }));

      await addFood(req, res);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Food Added' });
    });

    it('should return error if save fails', async () => {
      const req = mockReq({
        name: 'Pizza',
        description: 'Delicious',
        price: 100,
        category: 'Fast Food'
      }, { filename: 'pizza.jpg' });
      const res = mockRes();

      foodModel.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('fail'))
      }));

      await addFood(req, res);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Error' });
    });
  });

  describe('listFood', () => {
    it('should return food list', async () => {
      const req = mockReq();
      const res = mockRes();

      foodModel.find.mockResolvedValue([{ name: 'Pizza' }]);

      await listFood(req, res);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ name: 'Pizza' }] });
    });

    it('should return error on failure', async () => {
      const req = mockReq();
      const res = mockRes();

      foodModel.find.mockRejectedValue(new Error('fail'));

      await listFood(req, res);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'error' });
    });
  });

  describe('removeFood', () => {
    it('should remove food successfully', async () => {
      const req = mockReq({ id: 'food123' });
      const res = mockRes();

      foodModel.findById.mockResolvedValue({ image: 'pizza.jpg' });
      fs.unlink.mockImplementation((path, cb) => cb());
      foodModel.findByIdAndDelete.mockResolvedValue({});

      await removeFood(req, res);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Food removed' });
    });

    it('should return error on failure', async () => {
      const req = mockReq({ id: 'food123' });
      const res = mockRes();

      foodModel.findById.mockRejectedValue(new Error('fail'));

      await removeFood(req, res);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'error' });
    });
  });
});

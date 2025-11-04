import request from 'supertest';
import app from '../../server.js';
import userModel from '../../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('../../models/userModel.js');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('User API Integration', () => {
    afterEach(() => jest.clearAllMocks());

    it('POST /api/user/register should return success and token', async () => {
        userModel.findOne.mockResolvedValue(null);
        userModel.prototype.save = jest.fn().mockResolvedValue({ _id: 'userId' });
        bcrypt.genSalt.mockResolvedValue('salt');
        bcrypt.hash.mockResolvedValue('hashedPassword');
        jwt.sign.mockReturnValue('fakeToken');

        const res = await request(app)
            .post('/api/user/register')
            .send({ name: 'Test', email: 'test@example.com', password: '12345678' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ success: true, token: 'fakeToken' });
    });

    it('POST /api/user/login should return success and token', async () => {
        userModel.findOne.mockResolvedValue({ _id: 'userId', password: 'hashedPassword' });
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('fakeToken');

        const res = await request(app)
            .post('/api/user/login')
            .send({ email: 'test@example.com', password: '12345678' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ success: true, token: 'fakeToken' });
    });

    it('POST /api/user/login should return error for wrong password', async () => {
        userModel.findOne.mockResolvedValue({ _id: 'userId', password: 'hashedPassword' });
        bcrypt.compare.mockResolvedValue(false);

        const res = await request(app)
            .post('/api/user/login')
            .send({ email: 'test@example.com', password: 'wrongpass' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ success: false, message: 'Invalid credentials' });
    });
});

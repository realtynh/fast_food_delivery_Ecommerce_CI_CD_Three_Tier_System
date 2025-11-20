import request from 'supertest';
import app from '../../server.js';
import userModel from '../../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as Sentry from "@sentry/node";

jest.mock('../../models/userModel.js');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('User API Integration', () => {
    afterEach(() => jest.clearAllMocks());

    //  Chờ Sentry gửi dữ liệu trước khi tắt Jest
      afterAll(async () => {
        await Sentry.close(20000); // Chờ tối đa 2 giây
      });
    // --------------------------------------------------------

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

it('CI/CD Sentry Check: Should fail intentionally and report to Dashboard', async () => {
        // Giả lập: API trả về 200 OK
        userModel.findOne.mockResolvedValue({ _id: 'userId', password: 'hashedPassword' });
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('fakeToken');

        const res = await request(app)
            .post('/api/user/login')
            .send({ email: 'test@example.com', password: '12345678' });

        try {
            // --- ĐIỀU KIỆN GÂY FAIL ---
            // API trả về 200, nhưng ta expect 500 -> Chắc chắn Fail
            expect(res.statusCode).toBe(500); 
        } catch (error) {
            console.error("Test Failed (Expectedly). Sending to Sentry...");
            
            // Gửi lỗi Assertion của Jest lên Sentry
            Sentry.captureException(new Error(`CI/CD Test Failed Assertion: ${error.message}`));
            
            // Ném lại lỗi để Jest biết test này failed (và làm đỏ CI/CD)
            throw error;
        }
    });

});

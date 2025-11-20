// import "../../instrument.js";
import { loginUser, registerUser } from '../../controllers/userController.js';
import userModel from '../../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import httpMocks from 'node-mocks-http';
import * as Sentry from "@sentry/node";

jest.mock('../../models/userModel.js');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('validator');

describe('User Controller', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    

    describe('registerUser', () => {
        it('should register a new user and return token', async () => {
            const req = httpMocks.createRequest({
                body: { name: 'Test', email: 'test@example.com', password: '12345678' }
            });
            const res = httpMocks.createResponse();

            userModel.findOne.mockResolvedValue(null);
            validator.isEmail.mockReturnValue(true);
            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue('hashedPassword');
            userModel.prototype.save = jest.fn().mockResolvedValue({ _id: 'userId' });
            jwt.sign.mockReturnValue('fakeToken');

            await registerUser(req, res);

            expect(res._getJSONData()).toEqual({ success: true, token: 'fakeToken' });
        });

        it('should return error if user exists', async () => {
            const req = httpMocks.createRequest({
                body: { name: 'Test', email: 'test@example.com', password: '12345678' }
            });
            const res = httpMocks.createResponse();

            userModel.findOne.mockResolvedValue({ _id: 'existingUser' });

            await registerUser(req, res);
            expect(res._getJSONData()).toEqual({ success: false, message: 'User already exists' });
        });
    });

    describe('loginUser', () => {
        it('should login user and return token', async () => {
            const req = httpMocks.createRequest({
                body: { email: 'test@example.com', password: '12345678' }
            });
            const res = httpMocks.createResponse();

            userModel.findOne.mockResolvedValue({ _id: 'userId', password: 'hashedPassword' });
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('fakeToken');

            await loginUser(req, res);
            expect(res._getJSONData()).toEqual({ success: true, token: 'fakeToken' });
        });

        it('should return error if user does not exist', async () => {
            const req = httpMocks.createRequest({ body: { email: 'noone@example.com', password: '12345678' } });
            const res = httpMocks.createResponse();

            userModel.findOne.mockResolvedValue(null);

            await loginUser(req, res);
            expect(res._getJSONData()).toEqual({ success: false, message: "User doesn't exist" });
        });

        it('should return error if password invalid', async () => {
            const req = httpMocks.createRequest({ body: { email: 'test@example.com', password: 'wrongpass' } });
            const res = httpMocks.createResponse();

            userModel.findOne.mockResolvedValue({ password: 'hashedPassword' });
            bcrypt.compare.mockResolvedValue(false);

            await loginUser(req, res);
            expect(res._getJSONData()).toEqual({ success: false, message: "Invalid credentials" });
        });
    });
});

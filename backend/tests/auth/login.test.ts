import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { buildRes, buildMockUser } from '../../src/lib/testHelpers';
import { login } from '../../src/controllers/auth.controller';
import { User } from '../../src/models/user.model';
import bcrypt from 'bcrypt';
import { generateTokenAndSetCookie } from '../../src/utils/generateTokenAndSetCookie';

jest.mock('bcrypt');
jest.mock('../../src/utils/generateTokenAndSetCookie');
jest.mock('../../src/models/user.model');

const buildReq = (overrides = {}): Partial<Request> => ({
  body: {
    ...buildMockUser(),
    ...overrides,
  },
});

describe('Login Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;
  let mockUser: any;

  beforeEach(() => {
    jest.clearAllMocks();
    req = buildReq();
    res = buildRes();
    next = jest.fn();

    mockUser = {
      ...buildMockUser(),
      _id: new mongoose.Types.ObjectId(),
      hashedAuthToken: '$2b$12$fakehashedtoken',
      lastLogin: null,
      save: jest.fn().mockResolvedValue(undefined),
      toObject: jest.fn().mockReturnValue({
        name: 'Test User',
        email: 'test@example.com',
      }),
    };

    (User.findOne as jest.Mock).mockResolvedValue(mockUser); // user exists
    (bcrypt.compare as jest.Mock).mockResolvedValue(true); // password matches
    (generateTokenAndSetCookie as jest.Mock).mockImplementation(() => {});
  });

  describe('input validation', () => {
    const requiredFields = ['email', 'authToken'];
    test.each(requiredFields)('throws when %s is missing', async (field) => {
      req = buildReq({ [field]: undefined });
      await login(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('All fields are required');
    });
  });

  describe('JWT token', () => {
    test('does not generate and set JWT token if authToken is incorrect', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      const req = buildReq({ authToken: 'incorrect-auth-token' });
      await login(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Invalid credentials');
      expect(generateTokenAndSetCookie).not.toHaveBeenCalled();
    });
  });

  describe('error message', () => {
    test('returns Invalid credentials when user does not exist', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      await login(req as Request, res as Response, next);
      await new Promise(process.nextTick);
      expect(next.mock.calls[0][0].message).toBe('Invalid credentials');
    });

    test('returns same error when password is wrong', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      await login(req as Request, res as Response, next);
      await new Promise(process.nextTick);
      expect(next.mock.calls[0][0].message).toBe('Invalid credentials');
    });
  });

  describe('response serialization and sanitization', () => {
    const sensitiveFields = [
      'hashedAuthToken',
      'protectedDEK',
      'argon2Salt',
      'argon2Params',
      'verificationToken',
      'verificationTokenExpiresAt',
    ];

    test.each(sensitiveFields)(
      'does not include %s in response',
      async (field) => {
        mockUser.toObject.mockReturnValueOnce({
          name: 'Test User',
          email: 'test@example.com',
          hashedAuthToken: '$2b$12$fakehashedtoken',
          protectedDEK: 'base64encodedDEK==',
          argon2Salt: 'base64encodedSalt==',
          argon2Params: {},
          verificationToken: 123456,
          verificationTokenExpiresAt: Date.now(),
        });

        await login(req as Request, res as Response, next);
        await new Promise(process.nextTick);
        const body = (res.json as jest.Mock).mock.calls[0][0];
        expect(body.user).not.toHaveProperty(field);
      },
    );

    test('includes safe user fields in response', async () => {
      await login(req as Request, res as Response, next);
      await new Promise(process.nextTick);
      const body = (res.json as jest.Mock).mock.calls[0][0];
      expect(body.user).toHaveProperty('name', 'Test User');
      expect(body.user).toHaveProperty('email', 'test@example.com');
    });
  });

  describe('updated credentials', () => {
    test('lastLogin gets updated on successful login', async () => {
      await login(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(mockUser.lastLogin).toBeInstanceOf(Date);
      expect(mockUser.save).toHaveBeenCalled();
    });
  });
});

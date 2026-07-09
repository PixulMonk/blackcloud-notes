import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { buildRes, buildMockUser } from '../../src/lib/testHelpers';
import { checkAuth } from '../../src/controllers/auth.controller';
import { User } from '../../src/models/user.model';

jest.mock('bcrypt');
jest.mock('../../src/models/user.model');

const buildReq = (overrides = {}): Partial<Request> => ({
  user: new mongoose.Types.ObjectId().toString() as any,
  ...overrides,
});

describe('Check Auth Controller', () => {
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

    // IMPORTANT: checkAuth uses findById not findOne
    // This unit test will fail when someone choses to use findOne but in reality it should be ok
    (User.findById as jest.Mock).mockResolvedValue(null);
  });

  describe('user validation', () => {
    test('throws when user is not found', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);
      await checkAuth(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('User not found');
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

    test('returns 200 on success', async () => {
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      await checkAuth(req as Request, res as Response, next);
      await new Promise(process.nextTick);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('returns success: true', async () => {
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      await checkAuth(req as Request, res as Response, next);
      await new Promise(process.nextTick);
      const body = (res.json as jest.Mock).mock.calls[0][0];
      expect(body.success).toBe(true);
    });

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

        (User.findById as jest.Mock).mockResolvedValue(mockUser);

        await checkAuth(req as Request, res as Response, next);
        await new Promise(process.nextTick);
        const body = (res.json as jest.Mock).mock.calls[0][0];
        expect(body.user).not.toHaveProperty(field);
      },
    );

    test('includes safe user fields in response', async () => {
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      await checkAuth(req as Request, res as Response, next);
      await new Promise(process.nextTick);
      const body = (res.json as jest.Mock).mock.calls[0][0];
      expect(body.user).toHaveProperty('name', 'Test User');
      expect(body.user).toHaveProperty('email', 'test@example.com');
    });
  });
});

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

import { buildRes, buildMockUser } from '../../src/lib/testHelpers';
import { signup } from '../../src/controllers/auth.controller';
import { User } from '../../src/models/user.model';
import { generateTokenAndSetCookie } from '../../src/utils/generateTokenAndSetCookie';
import { sendVerificationEmail } from '../../src/mailer/emails';

jest.mock('bcrypt');
jest.mock('../../src/models/user.model');
jest.mock('../../src/utils/generateTokenAndSetCookie');
jest.mock('../../src/mailer/emails');
jest.mock('../../src/mailer/emailClient');

const buildReq = (overrides = {}): Partial<Request> => ({
  body: {
    ...buildMockUser(),
    ...overrides,
  },
});

describe('Signup Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;
  let mockUserInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    req = buildReq();
    res = buildRes();
    next = jest.fn();

    // Setup the User constructor mock to capture properties and return a "saved" promise
    (User as unknown as jest.Mock).mockImplementation((data) => {
      mockUserInstance = {
        ...data,
        _id: new mongoose.Types.ObjectId(),
        save: jest.fn().mockResolvedValue(true), // Ensure save returns a resolved promise
        toObject: jest.fn().mockReturnValue({
          name: data.name,
          email: data.email,
          _id: 'mock-id',
        }),
      };
      return mockUserInstance;
    });

    (User.findOne as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$12$fakehashedtoken');
    (generateTokenAndSetCookie as jest.Mock).mockImplementation(() => {});
    (sendVerificationEmail as jest.Mock).mockResolvedValue({ success: true });
  });

  describe('input validation', () => {
    const requiredFields = [
      'name',
      'email',
      'authToken',
      'protectedDEK',
      'argon2Salt',
      'argon2Params',
    ];

    test.each(requiredFields)('throws when %s is missing', async (field) => {
      req = buildReq({ [field]: undefined });
      await signup(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('All fields are required');
    });
  });

  describe('duplicate email', () => {
    test('throws when email already exists', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({
        email: 'existing@test.com',
      });
      await signup(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe(
        'Unable to create account. Please check your details or try logging in',
      );
    });
  });

  describe('auth token hashing', () => {
    test('hashes the authToken with bcrypt cost 12', async () => {
      await signup(req as Request, res as Response, next);
      expect(bcrypt.hash).toHaveBeenCalledWith('fake-auth-token-bytes', 12);
    });

    test('stores the hashed token, not the raw token', async () => {
      await signup(req as Request, res as Response, next);
      expect(mockUserInstance.hashedAuthToken).toBe('$2b$12$fakehashedtoken');
    });
  });

  describe('user persistence', () => {
    test('saves user with correct fields', async () => {
      await signup(req as Request, res as Response, next);
      expect(mockUserInstance.name).toBe('Test User');
      expect(mockUserInstance.protectedDEK).toBe('base64encodedDEK==');
    });

    test('generates a 6-digit verification token', async () => {
      await signup(req as Request, res as Response, next);
      expect(Number(mockUserInstance.verificationToken)).toBeGreaterThanOrEqual(
        100000,
      );
      expect(Number(mockUserInstance.verificationToken)).toBeLessThanOrEqual(
        999999,
      );
    });
  });

  describe('jwt generation', () => {
    test('calls generateTokenAndSetCookie after saving user', async () => {
      await signup(req as Request, res as Response, next);
      await new Promise(process.nextTick);
      expect(generateTokenAndSetCookie).toHaveBeenCalledTimes(1);
    });

    test('does not set JWT cookie if save fails', async () => {
      (User as unknown as jest.Mock).mockImplementationOnce((data) => {
        mockUserInstance = {
          ...data,
          save: jest.fn().mockRejectedValue(new Error('DB Error')),
        };
        return mockUserInstance;
      });

      await signup(req as Request, res as Response, next);
      expect(generateTokenAndSetCookie).not.toHaveBeenCalled();
    });
  });

  describe('verification email', () => {
    test('sends verification email with correct args', async () => {
      await signup(req as Request, res as Response, next);
      await new Promise(process.nextTick);
      expect(sendVerificationEmail).toHaveBeenCalledWith(
        'Test User',
        'test@example.com',
        expect.any(Number),
      );
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

    test('returns 201 on success', async () => {
      await signup(req as Request, res as Response, next);
      await new Promise(process.nextTick);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('returns success: true', async () => {
      await signup(req as Request, res as Response, next);
      await new Promise(process.nextTick);
      const body = (res.json as jest.Mock).mock.calls[0][0];
      expect(body.success).toBe(true);
    });

    test.each(sensitiveFields)(
      'does not include %s in response',
      async (field) => {
        mockUserInstance.toObject.mockReturnValueOnce({
          name: 'Test User',
          email: 'test@example.com',
          hashedAuthToken: '$2b$12$fakehashedtoken',
          protectedDEK: 'base64encodedDEK==',
          argon2Salt: 'base64encodedSalt==',
          argon2Params: {},
          verificationToken: 123456,
          verificationTokenExpiresAt: Date.now(),
        });

        await signup(req as Request, res as Response, next);
        await new Promise(process.nextTick);
        const body = (res.json as jest.Mock).mock.calls[0][0];
        expect(body.user).not.toHaveProperty(field);
      },
    );

    test('includes safe user fields in response', async () => {
      await signup(req as Request, res as Response, next);
      await new Promise(process.nextTick);
      const body = (res.json as jest.Mock).mock.calls[0][0];
      expect(body.user).toHaveProperty('name', 'Test User');
      expect(body.user).toHaveProperty('email', 'test@example.com');
    });
  });
});

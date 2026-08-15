import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { buildRes, buildMockUser } from '../../src/lib/testHelpers';
import { verifyEmail } from '../../src/controllers/auth.controller';
import { sendWelcomeEmail } from '../../src/mailer/emails';
import { User } from '../../src/models/user.model';

jest.mock('../../src/models/user.model');
jest.mock('../../src/mailer/emails');
jest.mock('../../src/mailer/emailClient');

describe('Verify Email Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;
  let mockUser: any;

  const buildReq = (overrides = {}): Partial<Request> => ({
    body: {
      code: '123456',
      ...overrides,
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    req = buildReq();
    res = buildRes();
    next = jest.fn();

    mockUser = {
      ...buildMockUser(),
      _id: new mongoose.Types.ObjectId(),
      isVerified: false,
      verificationToken: '123456',
      verificationTokenExpiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes from now,
      save: jest.fn().mockResolvedValue(undefined),
      toObject: jest.fn().mockReturnValue({
        name: 'Test User',
        email: 'test@example.com',
      }),
    };

    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (sendWelcomeEmail as jest.Mock).mockResolvedValue(undefined);
  });

  describe('verification', () => {
    test('should throw when verification code is incorrect', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      req = buildReq({ code: '111222' });
      await verifyEmail(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe(
        'Invalid or expired verification code',
      );
    });

    test('should throw when verification code is expired', async () => {
      // verifyEmail controller checks if code is expired by DB query: expiry date > time now
      // therefore, DB findOne will return null
      (User.findOne as jest.Mock).mockResolvedValue(null);
      req = buildReq({ code: '123456' });
      await verifyEmail(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe(
        'Invalid or expired verification code',
      );
    });

    test('should send welcome email upon success', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      req = buildReq({ code: '123456' });
      await verifyEmail(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(sendWelcomeEmail).toHaveBeenCalledWith(
        'Test User',
        'test@example.com',
      );
    });
  });

  describe('database updates', () => {
    test('sets isVerified to true upon success', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      req = buildReq({ code: '123456' });
      await verifyEmail(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(mockUser.isVerified).toBe(true);
      expect(mockUser.save).toHaveBeenCalled();
    });

    test('clears verification token and expiry upon success', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      req = buildReq({ code: '123456' });
      await verifyEmail(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(mockUser.verificationToken).toBeUndefined();
      expect(mockUser.verificationTokenExpiresAt).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe('on success', () => {
    test('returns 200 on success', async () => {
      await verifyEmail(req as Request, res as Response, next);
      await new Promise(process.nextTick);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});

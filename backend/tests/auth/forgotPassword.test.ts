import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { buildRes, buildMockUser } from '../../src/lib/testHelpers';
import { forgotPassword } from '../../src/controllers/auth.controller';
import { sendPasswordResetEmail } from '../../src/mailer/emails';
import {
  getProgressiveCooldown,
  getFakeAttempts,
} from '../../src/utils/cooldownHelpers';
import { User } from '../../src/models/user.model';

jest.mock('../../src/models/user.model');
jest.mock('../../src/mailer/emails');
jest.mock('../../src/utils/cooldownHelpers');
jest.mock('../../src/utils/cooldownHelpers');

describe('Forgot Password Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;
  let mockUser: any;

  const buildReq = (overrides = {}): Partial<Request> => ({
    body: {
      email: 'test@example.com',
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
      resendCooldowns: {
        passwordReset: new Date(),
        passwordResetResendAttempts: 0,
      },
      save: jest.fn().mockResolvedValue(undefined),
      toObject: jest.fn().mockReturnValue({
        name: 'Test User',
        email: 'test@example.com',
      }),
    };

    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);
    (getFakeAttempts as jest.Mock).mockResolvedValue(0);
  });

  describe('email enumeration protection', () => {
    test('returns generic 200 when user does not exist', async () => {
      req = buildReq({ email: 'does-not-exist@example.com' });
      (User.findOne as jest.Mock).mockResolvedValue(null);
      await forgotPassword(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(res.status).toHaveBeenCalledWith(200);
    });
    test('returns identical response whether user exists or not', async () => {
      const genericMessage =
        'If an account with that email exists, you will receive further instructions shortly.';

      // user does not exist
      (User.findOne as jest.Mock).mockResolvedValue(null);
      await forgotPassword(req as Request, res as Response, next);
      await new Promise(process.nextTick);
      const bodyWhenNoUser = (res.json as jest.Mock).mock.calls[0][0];

      jest.clearAllMocks();

      // user exists
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      await forgotPassword(req as Request, res as Response, next);
      await new Promise(process.nextTick);
      const bodyWhenUserExists = (res.json as jest.Mock).mock.calls[0][0];

      expect(bodyWhenNoUser.message).toBe(genericMessage);
      expect(bodyWhenUserExists.message).toBe(genericMessage);
      expect(bodyWhenNoUser.success).toBe(true);
      expect(bodyWhenUserExists.success).toBe(true);
    });
  });

  describe('rate limiting', () => {
    test('returns 429 when request is within cooldown period', async () => {
      (getProgressiveCooldown as jest.Mock).mockReturnValue(30_000);

      await forgotPassword(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(res.status).toHaveBeenCalledWith(429);
    });

    test('includes retryAfter in 429 response', async () => {
      (getProgressiveCooldown as jest.Mock).mockReturnValue(30_000);
      // call forgotPassword
      // process.nextTick
      await forgotPassword(req as Request, res as Response, next);
      await new Promise(process.nextTick);
      const body = (res.json as jest.Mock).mock.calls[0][0];

      // expect res.status to have been called with 429
      expect(res.status).toHaveBeenCalledWith(429);
      expect(body).toEqual(
        expect.objectContaining({
          success: false,
          retryAfter: expect.any(Number),
        }),
      );
    });

    test('resets attempts after 1 hour window', async () => {
      mockUser.resendCooldowns.passwordReset = new Date(
        Date.now() - 90 * 60 * 1000,
      ); // 90 mins ago
      mockUser.resendCooldowns.passwordResetResendAttempts = 5;

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await forgotPassword(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      // Final attempt should be 1, not 0, because successful attempts increment by 1
      expect(mockUser.resendCooldowns.passwordResetResendAttempts).toEqual(1);
    });
  });

  describe('on success', () => {
    test('sends password reset email with correct args', async () => {
      mockUser.resendCooldowns.passwordReset = new Date(
        Date.now() - 2 * 60 * 60 * 1000,
      );
      await forgotPassword(req as Request, res as Response, next);
      await new Promise(process.nextTick);
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        'Test User',
        'test@example.com',
        expect.stringContaining('/reset-password/'),
      );
    });

    test('returns 200 on success', async () => {
      mockUser.resendCooldowns.passwordReset = new Date(
        Date.now() - 2 * 60 * 60 * 1000,
      );
      await forgotPassword(req as Request, res as Response, next);
      await new Promise(process.nextTick);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('database updates', () => {
    test('increments passwordResetResendAttempts', async () => {
      // Need to make sure that the request is made in the past. Or else you will get a 429
      // A failed request does NOT increment the attempts count
      mockUser.resendCooldowns.passwordReset = new Date(
        Date.now() - 2 * 60 * 60 * 1000,
      );
      mockUser.resendCooldowns.passwordResetResendAttempts = 0;

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await forgotPassword(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      const finalAttempts =
        mockUser.resendCooldowns.passwordResetResendAttempts;

      expect(finalAttempts).toBe(1);
    });
  });
});

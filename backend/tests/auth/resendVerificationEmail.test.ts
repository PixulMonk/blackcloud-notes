import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { buildRes, buildMockUser } from '../../src/lib/testHelpers';
import { resendVerificationEmail } from '../../src/controllers/auth.controller';
import { sendVerificationEmail } from '../../src/mailer/emails';
import { User } from '../../src/models/user.model';
import {
  getProgressiveCooldown,
  checkCooldown,
  shouldResetAttempts,
} from '../../src/utils/cooldownHelpers';

jest.mock('../../src/models/user.model');
jest.mock('../../src/mailer/emails');
jest.mock('../../src/mailer/emailClient');
jest.mock('../../src/utils/cooldownHelpers');

describe('Resend Verification Email Controller', () => {
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
      isVerified: false,
      resendCooldowns: {
        verification: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        verificationResendAttempts: 0,
      },
      save: jest.fn().mockResolvedValue(undefined),
    };

    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);
    (getProgressiveCooldown as jest.Mock).mockReturnValue(30_000);
    (shouldResetAttempts as jest.Mock).mockReturnValue(false);
    (checkCooldown as jest.Mock).mockReturnValue({
      allowed: true,
      retryAfter: null,
    });
  });

  describe('input validation', () => {
    test('throws when email is not provided', async () => {
      req = buildReq({ email: undefined });
      await resendVerificationEmail(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Email is required');
    });
  });

  describe('user validation', () => {
    test('throws when user is not found', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      await resendVerificationEmail(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(next.mock.calls[0][0].message).toBe('User not found');
    });

    test('throws when user is already verified', async () => {
      mockUser.isVerified = true;
      await resendVerificationEmail(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(next.mock.calls[0][0].message).toBe('User already verified');
    });
  });

  describe('rate limiting', () => {
    test('returns 429 when within cooldown period', async () => {
      (checkCooldown as jest.Mock).mockReturnValue({
        allowed: false,
        retryAfter: 30,
      });
      await resendVerificationEmail(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(res.status).toHaveBeenCalledWith(429);
    });

    test('includes retryAfter in 429 response', async () => {
      (checkCooldown as jest.Mock).mockReturnValue({
        allowed: false,
        retryAfter: 30,
      });
      await resendVerificationEmail(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      const body = (res.json as jest.Mock).mock.calls[0][0];
      expect(body).toEqual(
        expect.objectContaining({
          success: false,
          retryAfter: 30,
        }),
      );
    });

    test('resets attempts after 1 hour window', async () => {
      (shouldResetAttempts as jest.Mock).mockReturnValue(true);
      mockUser.resendCooldowns.verificationResendAttempts = 5;

      await resendVerificationEmail(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      // reset to 0 then incremented to 1 on success
      expect(mockUser.resendCooldowns.verificationResendAttempts).toBe(1);
    });
  });

  describe('database updates', () => {
    test('generates a new 6-digit verification token', async () => {
      await resendVerificationEmail(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(String(mockUser.verificationToken)).toMatch(/^\d{6}$/);
    });

    test('sets verificationTokenExpiresAt ~5 minutes from now', async () => {
      const before = Date.now();
      await resendVerificationEmail(req as Request, res as Response, next);
      await new Promise(process.nextTick);
      const after = Date.now();

      const expiry = mockUser.verificationTokenExpiresAt.getTime();
      expect(expiry).toBeGreaterThanOrEqual(before + 5 * 60 * 1000 - 100);
      expect(expiry).toBeLessThanOrEqual(after + 5 * 60 * 1000 + 100);
    });

    test('increments verificationResendAttempts', async () => {
      mockUser.resendCooldowns.verificationResendAttempts = 2;
      await resendVerificationEmail(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(mockUser.resendCooldowns.verificationResendAttempts).toBe(3);
    });

    test('updates verification cooldown timestamp', async () => {
      const before = Date.now();
      await resendVerificationEmail(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(mockUser.resendCooldowns.verification).toBeInstanceOf(Date);
      expect(
        mockUser.resendCooldowns.verification.getTime(),
      ).toBeGreaterThanOrEqual(before);
    });

    test('saves user', async () => {
      await resendVerificationEmail(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe('verification email', () => {
    test('sends verification email with correct args', async () => {
      await resendVerificationEmail(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(sendVerificationEmail).toHaveBeenCalledWith(
        mockUser.name,
        mockUser.email,
        mockUser.verificationToken,
      );
    });

    test('does not send email if user is already verified', async () => {
      mockUser.isVerified = true;
      await resendVerificationEmail(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(sendVerificationEmail).not.toHaveBeenCalled();
    });

    test('does not send email if within cooldown period', async () => {
      (checkCooldown as jest.Mock).mockReturnValue({
        allowed: false,
        retryAfter: 30,
      });
      await resendVerificationEmail(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(sendVerificationEmail).not.toHaveBeenCalled();
    });
  });

  describe('response', () => {
    test('returns 200 on success', async () => {
      await resendVerificationEmail(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('returns success true', async () => {
      await resendVerificationEmail(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      const body = (res.json as jest.Mock).mock.calls[0][0];
      expect(body.success).toBe(true);
    });
  });
});

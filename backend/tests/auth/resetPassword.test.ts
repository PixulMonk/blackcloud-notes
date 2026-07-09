import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

import { buildRes, buildMockUser } from '../../src/lib/testHelpers';
import { resetPassword } from '../../src/controllers/auth.controller';
import { sendPasswordResetSuccessEmail } from '../../src/mailer/emails';
import { User } from '../../src/models/user.model';
import deleteUserData from './../../src/utils/deleteUserData';

jest.mock('bcrypt');
jest.mock('../../src/models/user.model');
jest.mock('../../src/mailer/emails');
jest.mock('./../../src/utils/deleteUserData');

describe('Reset Password Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;
  let mockUser: any;

  const buildReq = (
    bodyOverrides = {},
    paramOverrides = {},
  ): Partial<Request> => ({
    params: {
      token: 'valid-reset-token',
      ...paramOverrides,
    } as any,
    body: {
      newAuthToken: 'new-auth-token',
      newProtectedDEK: 'new-protected-dek',
      newArgon2Salt: 'new-argon2-salt',
      argon2Params: {
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 1,
        hashLength: 64,
        type: 2,
      },
      ...bodyOverrides,
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
      resetPasswordToken: 'valid-reset-token',
      resetPasswordExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      save: jest.fn().mockResolvedValue(undefined),
      toObject: jest
        .fn()
        .mockReturnValue({ name: 'Test User', email: 'test@example.com' }),
    };

    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (sendPasswordResetSuccessEmail as jest.Mock).mockResolvedValue(undefined);
    (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$12$newhashedtoken');
    (deleteUserData as jest.Mock).mockResolvedValue(undefined);
  });

  describe('input validation', () => {
    const requiredFields = [
      'newAuthToken',
      'newProtectedDEK',
      'newArgon2Salt',
      'argon2Params',
    ];
    test.each(requiredFields)('throws when %s is missing', async (field) => {
      req = buildReq({ [field]: undefined });
      // Gonna type cast to "any" instead; unknown is not enough
      // Just need this test to run. Satisfying the "Request" interface seems too much work for
      // ... what we need to do here
      await resetPassword(req as any, res as any, next);
      await new Promise(process.nextTick);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('All fields are required');
    });
  });

  describe('token validation', () => {
    test('throws when reset token is expired', async () => {
      // The controller checks if code is expired by DB query.. So not sure if manipulating time is necessary
      // Returns null if expired
      mockUser.resetPasswordExpiresAt = new Date(
        Date.now() - 2 * 60 * 60 * 1000,
      );
      (User.findOne as jest.Mock).mockResolvedValue(null);
      await resetPassword(req as any, res as any, next);
      await new Promise(process.nextTick);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe(
        'Invalid or expired reset link',
      );
    });

    test('throws when verification code is incorrect', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      req = buildReq({ token: 'incorrect-reset-token' });
      await resetPassword(req as any, res as any, next);
      await new Promise(process.nextTick);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe(
        'Invalid or expired reset link',
      );
    });
  });

  describe('database updates', () => {
    test('saves newly hashed token not the raw token', async () => {
      await resetPassword(req as any, res as any, next);
      await new Promise(process.nextTick);
      expect(mockUser.hashedAuthToken).toBe('$2b$12$newhashedtoken');
      expect(mockUser.hashedAuthToken).not.toBe('new-auth-token');
    });

    test('saves new credentials to user', async () => {
      await resetPassword(req as any, res as any, next);
      await new Promise(process.nextTick);

      // Assert that whatever was sent through the request ended up on the user
      // Instead of asserting a specific value
      expect(mockUser.protectedDEK).toBe(req.body.newProtectedDEK);
      expect(mockUser.argon2Salt).toBe(req.body.newArgon2Salt);
      expect(mockUser.argon2Params).toEqual(req.body.argon2Params);
    });

    test('deleteUserData is called with correct user ID', async () => {
      await resetPassword(req as any, res as any, next);
      await new Promise(process.nextTick);

      // Note: controller expects a string for _id, so convert to string
      expect(deleteUserData).toHaveBeenCalledWith(mockUser._id.toString());
    });

    test('deleteUserData is called before save', async () => {
      await resetPassword(req as any, res as any, next);
      await new Promise(process.nextTick);

      // TODO: test order
      const deleteOrder = (deleteUserData as jest.Mock).mock
        .invocationCallOrder[0];
      const saveOrder = mockUser.save.mock.invocationCallOrder[0];

      expect(deleteOrder).toBeLessThan(saveOrder);
    });

    test('save is called', async () => {
      await resetPassword(req as any, res as any, next);
      await new Promise(process.nextTick);

      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe('confirmation email', () => {
    test('sendPasswordResetSuccessEmail is called with correct args', async () => {
      await resetPassword(req as any, res as any, next);
      await new Promise(process.nextTick);
      expect(sendPasswordResetSuccessEmail).toHaveBeenCalledWith(
        'Test User',
        'test@example.com',
      );
    });

    test('sendPasswordResetSuccessEmail is NOT called if user not found', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      await resetPassword(req as any, res as any, next);
      await new Promise(process.nextTick);
      expect(sendPasswordResetSuccessEmail).not.toHaveBeenCalled();
    });
  });

  describe('response', () => {
    test('returns 200 on success', async () => {
      await resetPassword(req as any, res as any, next);
      await new Promise(process.nextTick);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('returns success true', async () => {
      await resetPassword(req as any, res as any, next);
      await new Promise(process.nextTick);

      const body = (res.json as jest.Mock).mock.calls[0][0];
      expect(body.success).toBe(true);
    });
  });
});

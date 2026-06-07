import { Request, Response } from 'express';

import { buildRes, buildMockUser } from '../../src/lib/testHelpers';
import { getLoginMetadata } from '../../src/controllers/auth.controller';
import { User } from '../../src/models/user.model';

jest.mock('../../src/models/user.model');

const mockUser = buildMockUser();

describe('Get Login Metadata Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeAll(() => {
    process.env.SALT_HMAC_SECRET = 'fake-hmac-server-secret-key';
  });

  beforeEach(() => {
    res = buildRes();
    next = jest.fn();
    jest.clearAllMocks();
    (User.findOne as jest.Mock).mockResolvedValue(null);
  });

  describe('input validation', () => {
    test('throws when email is not provided', async () => {
      const req: Partial<Request> = { body: { email: undefined } };
      await getLoginMetadata(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('All fields are required');
    });
  });

  describe('returned salt', () => {
    test('return correct salt stored in the database if user exists', async () => {
      const req: Partial<Request> = { body: { email: 'test@example.com' } };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      await getLoginMetadata(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      const body = (res.json as jest.Mock).mock.calls[0][0];
      expect(body).toEqual({
        success: true,
        argon2Salt: 'base64encodedSalt==',
        argon2Params: mockUser.argon2Params,
        protectedDEK: mockUser.protectedDEK,
      });
    });

    test('returns the same fake salt for the same email if user does not exist', async () => {
      const req: Partial<Request> = {
        body: { email: 'non-existent-user@example.com' },
      };

      await getLoginMetadata(req as Request, res as Response, next);
      await new Promise(process.nextTick);
      const firstSalt = (res.json as jest.Mock).mock.calls[0][0].argon2Salt;

      res = buildRes(); // fresh res for second call

      await getLoginMetadata(req as Request, res as Response, next);
      await new Promise(process.nextTick);
      const secondSalt = (res.json as jest.Mock).mock.calls[0][0].argon2Salt;

      expect(firstSalt).toEqual(secondSalt);
    });

    test('returns different fake salts for different emails', async () => {
      const req1 = { body: { email: 'alice@example.com' } };
      const req2 = { body: { email: 'bob@example.com' } };

      await getLoginMetadata(req1 as Request, res as Response, next);
      const firstSalt = (res.json as jest.Mock).mock.calls[0][0].argon2Salt;

      res = buildRes();

      await getLoginMetadata(req2 as Request, res as Response, next);
      const secondSalt = (res.json as jest.Mock).mock.calls[0][0].argon2Salt;

      expect(firstSalt).not.toEqual(secondSalt);
    });
  });
});

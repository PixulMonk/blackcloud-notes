import { Request, Response } from 'express';
import mongoose from 'mongoose';

import jwt from 'jsonwebtoken';
import { protectRoute } from '../../src/middleware/auth.middleware';
import { User } from '../../src/models/user.model';
import { buildRes, buildMockUser } from '../../src/lib/testHelpers';

jest.mock('jsonwebtoken');
jest.mock('../../src/models/user.model');

const buildReq = (overrides = {}): Partial<Request> => ({
  cookies: {
    jwt: 'fake-jwt-token',
    ...overrides,
  },
});

describe('Auth Middleware Test', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;
  let mockUser: any;
  let select: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    req = buildReq();
    res = buildRes();
    next = jest.fn();
    select = jest.fn();

    mockUser = {
      ...buildMockUser(),
      _id: new mongoose.Types.ObjectId(),
      save: jest.fn().mockResolvedValue(undefined),
    };

    (jwt.verify as jest.Mock).mockReturnValue({ userId: 'fake-user-id' });
    (User.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });
  });

  describe('input validation', () => {
    test('throws 401 when no token in cookies', async () => {
      req = { cookies: {} };

      await protectRoute(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next.mock.calls[0][0].message).toBe(
        'Unauthorized - No Token Provided',
      );
    });
  });

  describe('token validation', () => {
    test('throws when token is invalid/tampered', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid signature');
      });

      await protectRoute(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    test('throws when token is expired', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await protectRoute(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('jwt expired');
    });
  });

  describe('user lookup', () => {
    test('throws 404 when user is not found in DB', async () => {
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await protectRoute(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('User not found');
    });
  });

  describe('on success', () => {
    test('sets req.user to the found user', async () => {
      await protectRoute(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(req.user).toEqual(mockUser);
    });

    test('calls next() when everything is valid', async () => {
      await protectRoute(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(next).toHaveBeenCalledTimes(1);
    });

    test('does NOT call next() with an error on success', async () => {
      await protectRoute(req as Request, res as Response, next);
      await new Promise(process.nextTick);

      expect(next).toHaveBeenCalledWith(); // called with no arguments
    });
  });
});

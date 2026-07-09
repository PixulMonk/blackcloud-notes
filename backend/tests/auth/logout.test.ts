import { Request, Response } from 'express';
import { buildRes } from '../../src/lib/testHelpers';
import { logout } from '../../src/controllers/auth.controller';

describe('Logout Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {};
    res = buildRes();
  });

  describe('JWT cookie', () => {
    test('clears JWT cookie on logout', async () => {
      await logout(req as Request, res as Response);
      expect(res.cookie).toHaveBeenCalledWith('jwt', '', { maxAge: 0 });
    });
  });

  describe('response', () => {
    test('returns 200 on success', async () => {
      await logout(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('returns success true', async () => {
      await logout(req as Request, res as Response);
      const body = (res.json as jest.Mock).mock.calls[0][0];
      expect(body.success).toBe(true);
    });
  });
});

import { Response } from 'express';

export const buildRes = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
};

export const buildMockUser = (overrides = {}) => ({
  name: 'Test User',
  email: 'test@example.com',
  authToken: 'fake-auth-token-bytes',
  protectedDEK: 'base64encodedDEK==',
  argon2Salt: 'base64encodedSalt==',
  argon2Params: {
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
    hashLength: 64,
    type: 2,
  },
  ...overrides,
});

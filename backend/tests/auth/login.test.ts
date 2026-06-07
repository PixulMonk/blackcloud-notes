import { Request, Response } from 'express';

import { buildRes } from '../../src/lib/testHelpers';
import { login } from '../../src/controllers/auth.controller';
import { User } from '../../src/models/user.model';

jest.mock('../../src/models/user.model');

describe('Login Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    res = buildRes();
    next = jest.fn();
  });
  test.todo('Implement tests for this module');
});

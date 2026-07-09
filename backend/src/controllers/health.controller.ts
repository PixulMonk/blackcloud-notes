import { Request, Response } from 'express';
import type { HealthResponse } from '../types/health.types';

export const checkHealth = (
  req: Request<{}, HealthResponse, {}>,
  res: Response<HealthResponse>,
): void => {
  res.status(200).json({ status: 'ok' });
};

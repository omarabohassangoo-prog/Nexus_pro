import rateLimit from 'express-rate-limit';
import { ApiResponse } from '../types/common.types';

const response: ApiResponse = {
  success: false,
  message: 'عدد الطلبات كبير، حاول لاحقاً',
  code: 'RATE_LIMITED',
};

const common = {
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: unknown, res: { status: (n: number) => { json: (b: unknown) => void } }) =>
    res.status(429).json(response),
};

export const readLimiter = rateLimit({ ...common, windowMs: 60 * 1000, max: 300 });
export const writeLimiter = rateLimit({ ...common, windowMs: 60 * 1000, max: 30 });
export const authLimiter = rateLimit({ ...common, windowMs: 15 * 60 * 1000, max: 10, skipSuccessfulRequests: true });

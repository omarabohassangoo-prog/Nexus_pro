import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const REQUEST_ID_REGEX = /^[A-Za-z0-9_-]{8,64}$/;

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header('X-Request-ID');
  const id = incoming && REQUEST_ID_REGEX.test(incoming) ? incoming : crypto.randomUUID();
  req.requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
}

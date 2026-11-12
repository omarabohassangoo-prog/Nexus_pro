import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types/auth.types';

const ACCESS_TTL = '15m';
const REFRESH_TTL = '7d';

export function signAccess(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: ACCESS_TTL } as SignOptions);
}

export function signRefresh(payload: JwtPayload & { sid: string }): string {
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TTL } as SignOptions);
}

export function verifyAccess(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as unknown as JwtPayload;
}

export function verifyRefresh(token: string): JwtPayload & { sid: string } {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as unknown as JwtPayload & { sid: string };
}

export const TTL = { ACCESS: 15 * 60, REFRESH: 7 * 24 * 60 * 60 };

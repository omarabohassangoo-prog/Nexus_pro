import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { verifyAccess } from '../utils/jwt';
import type { AuthenticatedUser } from '../types/auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.header('Authorization');
    if (!header?.startsWith('Bearer ')) throw AppError.unauthorized('التوكن مفقود', 'TOKEN_MISSING');
    const token = header.slice(7);
    let payload: { sub: number; email: string };
    try { payload = verifyAccess(token); } catch { throw AppError.unauthorized('التوكن غير صالح أو منتهٍ', 'TOKEN_INVALID'); }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });
    if (!user || user.deletedAt) throw AppError.unauthorized('مستخدم غير موجود', 'USER_GONE');
    if (user.status !== 'ACTIVE') throw AppError.forbidden('الحساب غير مفعّل', 'NOT_ACTIVE');

    req.user = {
      id: user.id, email: user.email, type: user.type, roleId: user.roleId,
      permissions: user.role?.permissions.map(p => p.permission.key) ?? [],
    };
    next();
  } catch (e) { next(e); }
}

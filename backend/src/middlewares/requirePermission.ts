import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export function requirePermission(...keys: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(AppError.unauthorized());
    const has = keys.every(k => req.user!.permissions.includes(k));
    if (!has) return next(AppError.forbidden('لا تملك الصلاحية المطلوبة', 'PERMISSION_DENIED'));
    next();
  };
}

export function requireAnyPermission(...keys: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(AppError.unauthorized());
    const has = keys.some(k => req.user!.permissions.includes(k));
    if (!has) return next(AppError.forbidden('لا تملك أي صلاحية مطلوبة', 'PERMISSION_DENIED'));
    next();
  };
}

import { Request, Response, NextFunction } from 'express';
import { UserType } from '@prisma/client';
import { AppError } from '../utils/AppError';

export function authorize(...allowed: UserType[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(AppError.unauthorized());
    if (!allowed.includes(req.user.type)) return next(AppError.forbidden('لا تملك صلاحية الوصول', 'ROLE_FORBIDDEN'));
    next();
  };
}

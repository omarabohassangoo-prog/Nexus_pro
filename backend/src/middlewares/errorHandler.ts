import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import { ApiResponse } from '../types/common.types';

function mapPrismaError(err: Prisma.PrismaClientKnownRequestError): AppError {
  switch (err.code) {
    case 'P2002': {
      const target = (err.meta?.target as string[] | undefined)?.join(', ') ?? 'حقل';
      return AppError.conflict(`القيمة مكررة: ${target}`, 'UNIQUE_CONSTRAINT');
    }
    case 'P2025': return AppError.notFound('المورد غير موجود', 'NOT_FOUND');
    case 'P2003': return AppError.badRequest('مرجع غير صالح', 'FK_CONSTRAINT');
    case 'P2014': return AppError.conflict('العلاقة تمنع العملية', 'RELATION_VIOLATION');
    default:
      logger.error({ code: err.code, meta: err.meta }, 'Prisma error');
      return AppError.internal('خطأ في قاعدة البيانات', 'DB_ERROR');
  }
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  let appErr: AppError;

  if (err instanceof AppError) appErr = err;
  else if (err instanceof ZodError) appErr = AppError.unprocessable('بيانات غير صالحة', 'VALIDATION_ERROR', err.errors.map(e => ({ path: e.path.join('.'), message: e.message })));
  else if (err instanceof Prisma.PrismaClientKnownRequestError) appErr = mapPrismaError(err);
  else if (err instanceof Prisma.PrismaClientValidationError) appErr = AppError.badRequest('بيانات غير صالحة للاستعلام', 'DB_VALIDATION');
  else appErr = AppError.internal('خطأ غير متوقع', 'INTERNAL_ERROR');

  const logPayload = {
    requestId: req.requestId, method: req.method, url: req.originalUrl,
    statusCode: appErr.statusCode, code: appErr.code,
    userId: (req as unknown as { user?: { id: number } }).user?.id,
    err: env.NODE_ENV === 'development' ? (err as Error).stack : undefined,
  };
  if (appErr.statusCode >= 500) logger.error(logPayload, appErr.message);
  else logger.warn(logPayload, appErr.message);

  const body: ApiResponse = {
    success: false, message: appErr.message, code: appErr.code, requestId: req.requestId,
  };
  if (appErr.details) body.errors = appErr.details as ApiResponse['errors'];
  if (env.NODE_ENV === 'development' && err instanceof Error) body.data = { stack: err.stack };

  res.status(appErr.statusCode).json(body);
}

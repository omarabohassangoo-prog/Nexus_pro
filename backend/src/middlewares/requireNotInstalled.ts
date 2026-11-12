import { Request, Response, NextFunction } from 'express';
import { isInstalled } from '../services/install.service';
import { AppError } from '../utils/AppError';

export async function requireNotInstalled(_req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    if (await isInstalled()) throw AppError.conflict('التنصيب مكتمل', 'ALREADY_INSTALLED');
    next();
  } catch (e) { next(e); }
}

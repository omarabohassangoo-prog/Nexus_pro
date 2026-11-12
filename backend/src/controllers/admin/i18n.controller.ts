import { Request, Response } from 'express';
import { i18nService } from '../../services/i18n.service';
import type { ApiResponse } from '../../types/common.types';

export const adminI18nController = {
  async languages(_req: Request, res: Response) { res.json({ success: true, data: await i18nService.listLanguages() } as ApiResponse); },
  async getTranslations(req: Request, res: Response) { res.json({ success: true, data: await i18nService.getTranslations(req.params.code as string, String(req.query.ns ?? 'common')) } as ApiResponse); },
  async bulkUpsert(req: Request, res: Response) { await i18nService.bulkUpsert(req.params.code as string, req.body.namespace ?? 'common', req.body.entries ?? []); res.json({ success: true, message: 'تم الحفظ' } as ApiResponse); },
  async exportJson(req: Request, res: Response) { res.json({ success: true, data: await i18nService.exportJson(req.params.code as string) } as ApiResponse); },
};

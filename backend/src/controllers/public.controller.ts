import { Request, Response } from 'express';
import { i18nService } from '../services/i18n.service';
import { prisma } from '../config/prisma';
import type { ApiResponse } from '../types/common.types';

export const publicController = {
  async translations(req: Request, res: Response) {
    const code = String(req.params.code ?? 'ar');
    res.json({ success: true, data: await i18nService.getTranslations(code) } as ApiResponse);
  },
  async languages(_req: Request, res: Response) {
    res.json({ success: true, data: await i18nService.listLanguages() } as ApiResponse);
  },
  async contact(req: Request, res: Response) {
    const { name, email, message } = req.body as { name: string; email: string; message: string };
    await prisma.notification.create({ data: { userId: 1, type: 'contact_form', title: `رسالة من ${name}`, body: `${email}\n\n${message}` } }).catch(() => undefined);
    res.json({ success: true, message: 'تم استلام رسالتك' } as ApiResponse);
  },
};

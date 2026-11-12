import { Request, Response } from 'express';
import { notificationService } from '../../services/notification.service';
import type { ApiResponse } from '../../types/common.types';
import { buildPaginationMeta } from '../../utils/pagination';

export const notificationsController = {
  async list(req: Request, res: Response) {
    const page = Number(req.query.page ?? 1);
    const pageSize = Math.min(200, Number(req.query.pageSize ?? 20));
    const { items, total } = await notificationService.list(req.user!.id, page, pageSize);
    res.json({ success: true, data: { items, meta: buildPaginationMeta(total, page, pageSize) } } as ApiResponse);
  },
  async markRead(req: Request, res: Response) { await notificationService.markRead(req.user!.id, Number(req.params.id)); res.json({ success: true } as ApiResponse); },
  async markAllRead(req: Request, res: Response) { await notificationService.markAllRead(req.user!.id); res.json({ success: true } as ApiResponse); },
  async unreadCount(req: Request, res: Response) { res.json({ success: true, data: { count: await notificationService.unreadCount(req.user!.id) } } as ApiResponse); },
};

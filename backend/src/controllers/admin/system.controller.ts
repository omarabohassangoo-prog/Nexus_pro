import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { notificationService } from '../../services/notification.service';
import { presenceService } from '../../realtime/presence.service';
import { getIO } from '../../realtime/realtime.service';
import { AppError } from '../../utils/AppError';
import { auditService } from '../../services/audit.service';
import type { ApiResponse } from '../../types/common.types';

export const adminSystemController = {
  async health(_req: Request, res: Response) {
    const start = Date.now();
    let dbOk = true;
    try { await prisma.$queryRaw`SELECT 1`; } catch { dbOk = false; }
    const io = getIO();
    res.json({ success: true, data: { db: { ok: dbOk, latencyMs: Date.now() - start }, memory: process.memoryUsage(), uptime: process.uptime(), ws: { enabled: !!io, ...presenceService.stats() } } } as ApiResponse);
  },
  async broadcast(req: Request, res: Response) {
    const { message, level } = req.body as { message: string; level: 'info' | 'warning' | 'error' };
    await notificationService.broadcast(message, level);
    await auditService.log({ userId: req.user!.id, action: 'system.broadcast', entity: 'system', changes: { message, level }, requestId: req.requestId });
    res.json({ success: true, message: 'تم البث' } as ApiResponse);
  },
  async factoryReset(req: Request, res: Response) {
    const { confirm } = req.body as { confirm: string };
    if (confirm !== 'RESET') throw AppError.badRequest('اكتب RESET للتأكيد', 'CONFIRM_REQUIRED');
    if (req.user!.type !== 'SUPER_ADMIN') throw AppError.forbidden('super_admin فقط');
    await auditService.log({ userId: req.user!.id, action: 'system.reset', entity: 'system', requestId: req.requestId });
    res.json({ success: true, message: 'سيتم إعادة التعيين عبر CLI' } as ApiResponse);
  },
  async realtimeStats(_req: Request, res: Response) { res.json({ success: true, data: presenceService.stats() } as ApiResponse); },
};

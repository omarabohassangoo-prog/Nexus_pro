import { Request, Response } from 'express';
import { backupService } from '../../services/backup.service';
import { auditService } from '../../services/audit.service';
import type { ApiResponse } from '../../types/common.types';

export const adminBackupsController = {
  async list(_req: Request, res: Response) { res.json({ success: true, data: await backupService.list() } as ApiResponse); },
  async create(req: Request, res: Response) {
    const data = await backupService.create(req.user!.id);
    await auditService.log({ userId: req.user!.id, action: 'backup.create', entity: 'backup', entityId: data.id, requestId: req.requestId });
    res.status(201).json({ success: true, data } as ApiResponse);
  },
  async restore(req: Request, res: Response) {
    await backupService.restore(Number(req.params.id));
    await auditService.log({ userId: req.user!.id, action: 'backup.restore', entity: 'backup', entityId: Number(req.params.id), requestId: req.requestId });
    res.json({ success: true, message: 'تم الاستعادة' } as ApiResponse);
  },
  async remove(req: Request, res: Response) {
    await backupService.remove(Number(req.params.id));
    res.status(204).end();
  },
};

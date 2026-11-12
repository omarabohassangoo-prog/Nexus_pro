import { Request, Response } from 'express';
import { auditService } from '../../services/audit.service';
import type { ApiResponse } from '../../types/common.types';
import { buildPaginationMeta } from '../../utils/pagination';

export const adminAuditController = {
  async list(req: Request, res: Response) {
    const page = Number(req.query.page ?? 1);
    const pageSize = Math.min(200, Number(req.query.pageSize ?? 20));
    const filters = {
      action: req.query.action as string | undefined,
      entity: req.query.entity as string | undefined,
      userId: req.query.userId ? Number(req.query.userId) : undefined,
    };
    const { items, total } = await auditService.list(page, pageSize, filters);
    res.json({ success: true, data: { items, meta: buildPaginationMeta(total, page, pageSize) } } as ApiResponse);
  },
};

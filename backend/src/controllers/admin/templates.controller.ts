import { Request, Response } from 'express';
import { templateService } from '../../services/template.service';
import { auditService } from '../../services/audit.service';
import type { ApiResponse } from '../../types/common.types';

export const adminTemplatesController = {
  async list(_req: Request, res: Response) { res.json({ success: true, data: await templateService.list() } as ApiResponse); },
  async get(req: Request, res: Response) { res.json({ success: true, data: await templateService.getById(Number(req.params.id)) } as ApiResponse); },
  async create(req: Request, res: Response) {
    const data = await templateService.create(req.body, req.user!.id);
    await auditService.log({ userId: req.user!.id, action: 'template.create', entity: 'template', entityId: data.id, requestId: req.requestId });
    res.status(201).json({ success: true, data } as ApiResponse);
  },
  async update(req: Request, res: Response) {
    const data = await templateService.update(Number(req.params.id), req.body, req.user!.id);
    await auditService.log({ userId: req.user!.id, action: 'template.update', entity: 'template', entityId: data.id, requestId: req.requestId });
    res.json({ success: true, data } as ApiResponse);
  },
  async remove(req: Request, res: Response) {
    await templateService.remove(Number(req.params.id));
    await auditService.log({ userId: req.user!.id, action: 'template.delete', entity: 'template', entityId: Number(req.params.id), requestId: req.requestId });
    res.status(204).end();
  },
  async preview(req: Request, res: Response) {
    const { context, language } = req.body as { context: Record<string, unknown>; language?: string };
    const template = await templateService.getById(Number(req.params.id));
    const data = await templateService.preview(template.key, context, language);
    res.json({ success: true, data } as ApiResponse);
  },
  async restoreVersion(req: Request, res: Response) {
    const data = await templateService.restoreVersion(Number(req.params.id), Number(req.params.versionId), req.user!.id);
    res.json({ success: true, data } as ApiResponse);
  },
};

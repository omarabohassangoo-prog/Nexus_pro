import { Request, Response } from 'express';
import { userService } from '../../services/user.service';
import { auditService } from '../../services/audit.service';
import type { ApiResponse } from '../../types/common.types';

export const adminUsersController = {
  async list(req: Request, res: Response) { res.json({ success: true, data: await userService.list(req.query as never) } as ApiResponse); },
  async get(req: Request, res: Response) { res.json({ success: true, data: await userService.getById(Number(req.params.id)) } as ApiResponse); },
  async create(req: Request, res: Response) {
    const data = await userService.create(req.body);
    await auditService.log({ userId: req.user!.id, action: 'user.create', entity: 'user', entityId: data.id, requestId: req.requestId, ipAddress: req.ip });
    res.status(201).json({ success: true, data } as ApiResponse);
  },
  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const data = await userService.update(id, req.body, req.user!.id);
    await auditService.log({ userId: req.user!.id, action: 'user.update', entity: 'user', entityId: id, changes: req.body, requestId: req.requestId, ipAddress: req.ip });
    res.json({ success: true, data } as ApiResponse);
  },
  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    await userService.remove(id, req.user!.id);
    await auditService.log({ userId: req.user!.id, action: 'user.delete', entity: 'user', entityId: id, requestId: req.requestId, ipAddress: req.ip });
    res.status(204).end();
  },
  async suspend(req: Request, res: Response) {
    const id = Number(req.params.id);
    await userService.suspend(id, req.user!.id);
    await auditService.log({ userId: req.user!.id, action: 'user.suspend', entity: 'user', entityId: id, requestId: req.requestId });
    res.json({ success: true, message: 'تم التعليق' } as ApiResponse);
  },
};

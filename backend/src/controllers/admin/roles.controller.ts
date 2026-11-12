import { Request, Response } from 'express';
import { roleService } from '../../services/role.service';
import { auditService } from '../../services/audit.service';
import type { ApiResponse } from '../../types/common.types';

export const adminRolesController = {
  async list(_req: Request, res: Response) { res.json({ success: true, data: await roleService.list() } as ApiResponse); },
  async permissions(_req: Request, res: Response) { res.json({ success: true, data: await roleService.listPermissions() } as ApiResponse); },
  async create(req: Request, res: Response) {
    const { name, description, permissionKeys } = req.body;
    const data = await roleService.create(name, description, permissionKeys);
    await auditService.log({ userId: req.user!.id, action: 'role.create', entity: 'role', entityId: data.id, requestId: req.requestId });
    res.status(201).json({ success: true, data } as ApiResponse);
  },
  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const data = await roleService.update(id, req.body);
    await auditService.log({ userId: req.user!.id, action: 'role.update', entity: 'role', entityId: id, changes: req.body, requestId: req.requestId });
    res.json({ success: true, data } as ApiResponse);
  },
  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    await roleService.remove(id);
    await auditService.log({ userId: req.user!.id, action: 'role.delete', entity: 'role', entityId: id, requestId: req.requestId });
    res.status(204).end();
  },
};

import { Request, Response } from 'express';
import { settingsService } from '../../services/settings.service';
import { auditService } from '../../services/audit.service';
import type { ApiResponse } from '../../types/common.types';

export const adminSettingsController = {
  async getGroup(req: Request, res: Response) { res.json({ success: true, data: await settingsService.getGroup(req.params.group as never) } as ApiResponse); },
  async updateGroup(req: Request, res: Response) {
    const group = req.params.group as never;
    const { items } = req.body as { items: Array<{ key: string; value: string }> };
    const result = await settingsService.updateGroup(group, items, { id: req.user!.id, canManageSecrets: req.user!.permissions.includes('settings.manage_secrets') });
    await auditService.log({ userId: req.user!.id, action: 'settings.update', entity: 'settings', changes: { group, keys: items.map(i => i.key) }, requestId: req.requestId, ipAddress: req.ip });
    res.json({ success: true, data: result, message: 'تم الحفظ' } as ApiResponse);
  },
  async testGroup(req: Request, res: Response) { res.json({ success: true, data: await settingsService.testConnection(req.params.group as never) } as ApiResponse); },
  async publicSettings(_req: Request, res: Response) { res.json({ success: true, data: await settingsService.getPublic() } as ApiResponse); },
};

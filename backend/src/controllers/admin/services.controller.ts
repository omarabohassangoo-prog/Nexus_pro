import { Request, Response } from 'express';
import { emailService } from '../../services/external/email.service';
import { smsService } from '../../services/external/sms.service';
import { whatsappService } from '../../services/external/whatsapp.service';
import { paypalService } from '../../services/external/paypal.service';
import type { ApiResponse } from '../../types/common.types';

const map: Record<string, { testConnection: () => Promise<unknown>; reload: () => Promise<void> }> = { email: emailService, sms: smsService, whatsapp: whatsappService, paypal: paypalService };

export const adminServicesController = {
  async test(req: Request, res: Response) {
    const svc = map[req.params.service as string];
    if (!svc) { res.status(404).json({ success: false, message: 'خدمة غير معروفة' }); return; }
    res.json({ success: true, data: await svc.testConnection() } as ApiResponse);
  },
  async reload(req: Request, res: Response) {
    const svc = map[req.params.service as string];
    if (!svc) { res.status(404).json({ success: false, message: 'خدمة غير معروفة' }); return; }
    await svc.reload();
    res.json({ success: true, message: 'تم إعادة التحميل' } as ApiResponse);
  },
};

import { Request, Response } from 'express';
import { statsService } from '../../services/stats.service';
import type { ApiResponse } from '../../types/common.types';

export const adminDashboardController = {
  async overview(_req: Request, res: Response) { res.json({ success: true, data: await statsService.dashboard() } as ApiResponse); },
};

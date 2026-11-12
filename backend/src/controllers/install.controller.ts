import { Request, Response } from 'express';
import { installService } from '../services/install.service';
import type { ApiResponse } from '../types/common.types';

export const installController = {
  async status(_req: Request, res: Response) { res.json({ success: true, data: await installService.status() } as ApiResponse); },
  async requirements(_req: Request, res: Response) { res.json({ success: true, data: await installService.requirements() } as ApiResponse); },
  async validate(req: Request, res: Response) { res.json({ success: true, data: await installService.validate(req.body) } as ApiResponse); },
  async run(req: Request, res: Response) { const data = await installService.run(req.body); res.status(201).json({ success: true, data } as ApiResponse); },
  async emergency(req: Request, res: Response) { const data = await installService.emergency(req.body); res.status(201).json({ success: true, data } as ApiResponse); },
};

import { Request, Response } from 'express';
import { userService } from '../../services/user.service';
import type { ApiResponse } from '../../types/common.types';

export const profileController = {
  async getMe(req: Request, res: Response) { res.json({ success: true, data: await userService.getById(req.user!.id) } as ApiResponse); },
  async updateMe(req: Request, res: Response) { res.json({ success: true, data: await userService.updateProfile(req.user!.id, req.body) } as ApiResponse); },
};

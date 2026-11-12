import { Request, Response } from 'express';
import { mediaService } from '../../services/media.service';
import { AppError } from '../../utils/AppError';
import type { ApiResponse } from '../../types/common.types';

export const adminMediaController = {
  async upload(req: Request, res: Response) {
    if (!req.file) throw AppError.badRequest('لا يوجد ملف', 'FILE_MISSING');
    const data = await mediaService.save({ buffer: req.file.buffer, originalname: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size }, req.user!.id);
    res.status(201).json({ success: true, data } as ApiResponse);
  },
  async list(req: Request, res: Response) {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);
    res.json({ success: true, data: await mediaService.list(page, pageSize) } as ApiResponse);
  },
  async remove(req: Request, res: Response) {
    await mediaService.remove(Number(req.params.id));
    res.status(204).end();
  },
};

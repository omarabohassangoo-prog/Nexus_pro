// ═══════════════════════════════════════════════════════
// Vercel Blob Media Service — يحل محل media.service.ts
// ═══════════════════════════════════════════════════════
import { put, del } from '@vercel/blob';
import crypto from 'crypto';
import path from 'path';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { settingsService } from './settings.service';
import { logger } from '../utils/logger';

const DEFAULT_MAX_MB = 10;
const DEFAULT_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export const mediaService = {
  async validate(file: UploadedFile): Promise<void> {
    const maxMB = Number(await settingsService.getInternal('files.maxSizeMB') ?? DEFAULT_MAX_MB);
    const allowed = (await settingsService.getInternal('files.allowedMimes') ?? DEFAULT_MIMES.join(','))
      .split(',').map(s => s.trim()).filter(Boolean);
    if (file.size > maxMB * 1024 * 1024) {
      throw new AppError(`الملف كبير (الحد ${maxMB}MB)`, 413, 'FILE_TOO_LARGE');
    }
    if (!allowed.includes(file.mimetype)) {
      throw new AppError(`نوع الملف غير مدعوم (${file.mimetype})`, 415, 'UNSUPPORTED_MEDIA');
    }
  },

  async save(file: UploadedFile, userId?: number) {
    await mediaService.validate(file);
    const ext = path.extname(file.originalname) || '';
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;

    const blob = await put(`uploads/${filename}`, file.buffer, {
      access: 'public',
      contentType: file.mimetype,
      addRandomSuffix: false,
    });

    const record = await prisma.mediaFile.create({
      data: {
        userId,
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storage: 'vercel-blob',
        path: blob.pathname,
        url: blob.url,
      },
    });
    logger.info({ id: record.id, url: blob.url, size: file.size }, 'media uploaded to Vercel Blob');
    return record;
  },

  async getById(id: number) {
    const f = await prisma.mediaFile.findUnique({ where: { id } });
    if (!f) throw AppError.notFound('الملف غير موجود');
    return f;
  },

  async remove(id: number) {
    const f = await prisma.mediaFile.findUnique({ where: { id } });
    if (!f) throw AppError.notFound('الملف غير موجود');
    try { await del(f.url); } catch (e) { logger.warn({ err: (e as Error).message }, 'blob delete failed'); }
    await prisma.mediaFile.delete({ where: { id } });
  },

  async list(page: number, pageSize: number) {
    const [total, items] = await Promise.all([
      prisma.mediaFile.count(),
      prisma.mediaFile.findMany({ skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: 'desc' } }),
    ]);
    return { items, total, page, pageSize };
  },
};

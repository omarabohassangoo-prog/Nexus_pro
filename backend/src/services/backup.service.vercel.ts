// ═══════════════════════════════════════════════════════
// Vercel Backup Service — يستخدم Blob بدل الملفات المحلية
// ═══════════════════════════════════════════════════════
import { put, del } from '@vercel/blob';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

const KEEP_LAST = 7;

const TABLES = [
  'user', 'role', 'permission', 'rolePermission', 'page',
  'template', 'templateVersion', 'systemSetting', 'language',
  'translation', 'notification', 'payment', 'mediaFile',
] as const;

export const backupService = {
  async create(createdBy?: number) {
    const filename = `backups/backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const payload: Record<string, unknown> = { createdAt: new Date().toISOString() };

    for (const t of TABLES) {
      payload[t] = await (prisma as unknown as Record<string, { findMany: () => Promise<unknown[]> }>)[t].findMany();
    }

    const buffer = Buffer.from(JSON.stringify(payload, null, 2));
    const blob = await put(filename, buffer, { access: 'public', contentType: 'application/json', addRandomSuffix: false });

    const record = await prisma.backup.create({
      data: { filename: blob.pathname, size: buffer.length, status: 'completed', createdBy },
    });
    await backupService.pruneOld();
    logger.info({ id: record.id, url: blob.url, size: buffer.length }, 'backup created on Blob');
    return { ...record, url: blob.url };
  },

  async restore(backupId: number) {
    const record = await prisma.backup.findUnique({ where: { id: backupId } });
    if (!record) throw AppError.notFound('النسخة غير موجودة');

    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: record.filename });
    if (!blobs.length) throw AppError.notFound('ملف النسخة غير موجود على Blob');

    const res = await fetch(blobs[0]!.url);
    if (!res.ok) throw AppError.internal('فشل تحميل النسخة');
    const data = (await res.json()) as Record<string, unknown[]>;

    await prisma.$transaction(async tx => {
      await tx.rolePermission.deleteMany(); await tx.permission.deleteMany();
      await tx.translation.deleteMany(); await tx.language.deleteMany();
      await tx.template.deleteMany(); await tx.page.deleteMany();
      await tx.notification.deleteMany(); await tx.systemSetting.deleteMany();
      await tx.user.deleteMany(); await tx.role.deleteMany();
      if (data.role) await tx.role.createMany({ data: data.role as never });
      if (data.permission) await tx.permission.createMany({ data: data.permission as never });
      if (data.user) await tx.user.createMany({ data: data.user as never });
      if (data.rolePermission) await tx.rolePermission.createMany({ data: data.rolePermission as never });
      if (data.systemSetting) await tx.systemSetting.createMany({ data: data.systemSetting as never });
      if (data.page) await tx.page.createMany({ data: data.page as never });
      if (data.template) await tx.template.createMany({ data: data.template as never });
      if (data.language) await tx.language.createMany({ data: data.language as never });
      if (data.translation) await tx.translation.createMany({ data: data.translation as never });
    });
    logger.info({ backupId }, 'backup restored from Blob');
    return { ok: true };
  },

  async list() {
    return prisma.backup.findMany({ orderBy: { createdAt: 'desc' } });
  },

  async remove(id: number) {
    const record = await prisma.backup.findUnique({ where: { id } });
    if (!record) throw AppError.notFound('النسخة غير موجودة');
    try {
      const { list } = await import('@vercel/blob');
      const { blobs } = await list({ prefix: record.filename });
      for (const b of blobs) await del(b.url);
    } catch { /* ignore */ }
    await prisma.backup.delete({ where: { id } });
  },

  async pruneOld() {
    const all = await prisma.backup.findMany({ orderBy: { createdAt: 'desc' } });
    const { list } = await import('@vercel/blob');
    for (const b of all.slice(KEEP_LAST)) {
      try {
        const { blobs } = await list({ prefix: b.filename });
        for (const blob of blobs) await del(blob.url);
      } catch { /* ignore */ }
      await prisma.backup.delete({ where: { id: b.id } });
    }
  },
};

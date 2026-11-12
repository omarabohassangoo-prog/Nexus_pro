import fs from 'fs/promises';
import path from 'path';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

const BACKUP_DIR = path.resolve(process.cwd(), 'backups');
const KEEP_LAST = 7;

export const backupService = {
  async ensureDir() { await fs.mkdir(BACKUP_DIR, { recursive: true }); },

  async create(createdBy?: number) {
    await backupService.ensureDir();
    const filename = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const fullPath = path.join(BACKUP_DIR, filename);
    const tables = ['user', 'role', 'permission', 'rolePermission', 'page', 'template', 'systemSetting', 'language', 'translation', 'notification'] as const;
    const payload: Record<string, unknown> = { createdAt: new Date().toISOString() };
    for (const t of tables) { payload[t] = await (prisma as unknown as Record<string, { findMany: () => Promise<unknown[]> }>)[t].findMany(); }
    await fs.writeFile(fullPath, JSON.stringify(payload, null, 2));
    const stat = await fs.stat(fullPath);
    const record = await prisma.backup.create({ data: { filename, size: stat.size, status: 'completed', createdBy } });
    await backupService.pruneOld();
    logger.info({ id: record.id, size: stat.size }, 'backup created');
    return record;
  },

  async restore(backupId: number) {
    const record = await prisma.backup.findUnique({ where: { id: backupId } });
    if (!record) throw AppError.notFound('النسخة غير موجودة');
    const raw = await fs.readFile(path.join(BACKUP_DIR, record.filename), 'utf8');
    const data = JSON.parse(raw) as Record<string, unknown[]>;
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
    logger.info({ backupId }, 'backup restored');
    return { ok: true };
  },

  async list() { return prisma.backup.findMany({ orderBy: { createdAt: 'desc' } }); },

  async remove(id: number) {
    const record = await prisma.backup.findUnique({ where: { id } });
    if (!record) throw AppError.notFound('النسخة غير موجودة');
    try { await fs.unlink(path.join(BACKUP_DIR, record.filename)); } catch { /* ignore */ }
    await prisma.backup.delete({ where: { id } });
  },

  async pruneOld() {
    const all = await prisma.backup.findMany({ orderBy: { createdAt: 'desc' } });
    for (const b of all.slice(KEEP_LAST)) {
      try { await fs.unlink(path.join(BACKUP_DIR, b.filename)); } catch { /* ignore */ }
      await prisma.backup.delete({ where: { id: b.id } });
    }
  },
};

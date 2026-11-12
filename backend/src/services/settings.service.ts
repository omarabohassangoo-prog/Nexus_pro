import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { encrypt, decrypt } from '../utils/crypto';
import { cache, TTL } from './external/cache.service';
import { logger } from '../utils/logger';

type Group = 'general' | 'env' | 'database' | 'email' | 'sms' | 'whatsapp' | 'paypal' | 'files' | 'css' | 'i18n' | 'cloud' | 'secrets';

const SECRET_MASK = '***';
const CACHE_PREFIX = 'settings:';

export interface SettingRow {
  key: string; value: string; group: string;
  isSecret: boolean; isEncrypted: boolean; updatedAt: Date;
}

function maskValue(row: SettingRow): SettingRow {
  if (!row.isSecret) return row;
  return { ...row, value: SECRET_MASK };
}

export const settingsService = {
  async getInternal(key: string): Promise<string | null> {
    const cached = cache.get<{ value: string }>(`${CACHE_PREFIX}raw:${key}`);
    if (cached) return cached.value;

    const row = await prisma.systemSetting.findUnique({ where: { key } });
    if (!row) return null;

    let value = row.value;
    if (row.isEncrypted) {
      try { value = decrypt(row.value); }
      catch { logger.error({ key }, 'decrypt failed'); return null; }
    }
    cache.set(`${CACHE_PREFIX}raw:${key}`, { value }, TTL.SETTINGS);
    return value;
  },

  async getManyInternal(keys: string[]): Promise<Record<string, string | null>> {
    const out: Record<string, string | null> = {};
    await Promise.all(keys.map(async k => { out[k] = await settingsService.getInternal(k); }));
    return out;
  },

  async getGroup(group: Group): Promise<SettingRow[]> {
    const cacheKey = `${CACHE_PREFIX}group:${group}`;
    const cached = cache.get<SettingRow[]>(cacheKey);
    if (cached) return cached;

    const rows = await prisma.systemSetting.findMany({ where: { group }, orderBy: { key: 'asc' } });
    const safe = rows.map(r => maskValue(r));
    cache.set(cacheKey, safe, TTL.SETTINGS);
    return safe;
  },

  async getPublic(): Promise<Record<string, string>> {
    const cacheKey = `${CACHE_PREFIX}public`;
    const cached = cache.get<Record<string, string>>(cacheKey);
    if (cached) return cached;

    const rows = await prisma.systemSetting.findMany({
      where: { isSecret: false, group: { in: ['general', 'css', 'i18n'] } },
      select: { key: true, value: true, isEncrypted: true },
    });
    const out: Record<string, string> = {};
    for (const r of rows) out[r.key] = r.isEncrypted ? SECRET_MASK : r.value;
    cache.set(cacheKey, out, TTL.SETTINGS);
    return out;
  },

  async updateGroup(group: Group, items: Array<{ key: string; value: string }>, actor: { id: number; canManageSecrets: boolean }): Promise<{ updated: number; skipped: number }> {
    const existing = await prisma.systemSetting.findMany({
      where: { group, key: { in: items.map(i => i.key) } },
    });
    const existingMap = new Map(existing.map(e => [e.key, e]));

    let updated = 0, skipped = 0;
    for (const item of items) {
      const row = existingMap.get(item.key);
      if (!row) { skipped++; continue; }

      if (row.isSecret && !actor.canManageSecrets) throw AppError.forbidden('لا تملك صلاحية تعديل الأسرار', 'SECRETS_FORBIDDEN');
      if (row.isSecret && (item.value === '' || item.value === SECRET_MASK)) { skipped++; continue; }

      let value = item.value;
      let isEncrypted = row.isEncrypted;
      if (row.isSecret) { value = encrypt(item.value); isEncrypted = true; }

      await prisma.systemSetting.update({ where: { key: item.key }, data: { value, isEncrypted } });
      updated++;
    }

    cache.deletePrefix(CACHE_PREFIX);
    return { updated, skipped };
  },

  async setOne(key: string, value: string, group: Group, isSecret = false): Promise<void> {
    const encrypted = isSecret ? encrypt(value) : value;
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value: encrypted, isEncrypted: isSecret, group, isSecret },
      create: { key, value: encrypted, isEncrypted: isSecret, group, isSecret },
    });
    cache.deletePrefix(CACHE_PREFIX);
  },

  async testConnection(group: Group): Promise<{ ok: boolean; message: string; latencyMs?: number }> {
    const t0 = Date.now();
    try {
      switch (group) {
        case 'database':
          await prisma.$queryRaw`SELECT 1`;
          return { ok: true, message: 'قاعدة البيانات متصلة', latencyMs: Date.now() - t0 };
        case 'email': {
          const { emailService } = await import('./external/email.service');
          const r = await emailService.testConnection();
          return { ...r, latencyMs: Date.now() - t0 };
        }
        case 'files': {
          const fs = await import('fs/promises');
          const path = await import('path');
          const uploadsDir = path.resolve(process.cwd(), 'uploads');
          await fs.mkdir(uploadsDir, { recursive: true });
          await fs.access(uploadsDir);
          return { ok: true, message: 'Storage: local', latencyMs: Date.now() - t0 };
        }
        default:
          return { ok: true, message: 'لا يحتاج اختبار اتصال', latencyMs: Date.now() - t0 };
      }
    } catch (e) { return { ok: false, message: (e as Error).message, latencyMs: Date.now() - t0 }; }
  },
};

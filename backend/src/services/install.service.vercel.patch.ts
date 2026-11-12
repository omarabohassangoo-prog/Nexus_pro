// ═══════════════════════════════════════════════════════
// استبدل install.service.ts بدوال Vercel-compatible
// (لا exec، لا filesystem)
// ═══════════════════════════════════════════════════════
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { hashPassword } from '../utils/password';
import { logger } from '../utils/logger';

// لا يوجد lock file على Vercel — نعتمد على DB flag + env
async function checkDbFlag(): Promise<boolean> {
  try {
    const s = await prisma.systemSetting.findUnique({ where: { key: 'app.installed' } });
    return s?.value === 'true';
  } catch { return false; }
}

function checkEnvFlag(): boolean {
  return process.env.INSTALL_LOCKED === 'true';
}

export async function isInstalled(): Promise<boolean> {
  const dbLock = await checkDbFlag();
  return dbLock && checkEnvFlag();
}

export const installService = {
  async status() {
    return {
      installed: await isInstalled(),
      lockFile: false,
      dbFlag: await checkDbFlag(),
      envFlag: checkEnvFlag(),
      environment: 'vercel',
    };
  },

  async requirements() {
    const checks: Array<{ key: string; label: string; ok: boolean; current: string; required: string }> = [];
    checks.push({ key: 'platform', label: 'Vercel', ok: true, current: 'serverless', required: 'serverless' });
    checks.push({ key: 'dburl', label: 'DATABASE_URL', ok: !!process.env.DATABASE_URL, current: process.env.DATABASE_URL ? 'set' : 'missing', required: 'set' });
    checks.push({ key: 'jwt', label: 'JWT_SECRET', ok: (process.env.JWT_SECRET?.length ?? 0) >= 32, current: `${process.env.JWT_SECRET?.length ?? 0} chars`, required: '≥32' });
    checks.push({ key: 'refresh', label: 'REFRESH_TOKEN_SECRET', ok: (process.env.REFRESH_TOKEN_SECRET?.length ?? 0) >= 32, current: `${process.env.REFRESH_TOKEN_SECRET?.length ?? 0} chars`, required: '≥32' });
    checks.push({ key: 'enc', label: 'ENCRYPTION_KEY', ok: /^[0-9a-f]{64}$/i.test(process.env.ENCRYPTION_KEY ?? ''), current: `${process.env.ENCRYPTION_KEY?.length ?? 0} chars`, required: '64 hex' });
    checks.push({ key: 'blob', label: 'BLOB_READ_WRITE_TOKEN', ok: !!process.env.BLOB_READ_WRITE_TOKEN, current: process.env.BLOB_READ_WRITE_TOKEN ? 'set' : 'missing', required: 'set' });
    try { const t = Date.now(); await prisma.$queryRaw`SELECT 1`; checks.push({ key: 'db', label: 'PostgreSQL', ok: true, current: `connected (${Date.now() - t}ms)`, required: 'connected' }); }
    catch { checks.push({ key: 'db', label: 'PostgreSQL', ok: false, current: 'disconnected', required: 'connected' }); }
    const st = await installService.status();
    checks.push({ key: 'not_installed', label: 'لم يتم التنصيب سابقاً', ok: !st.installed, current: st.installed ? 'installed' : 'ready', required: 'ready' });
    return { ok: checks.every(c => c.ok), checks };
  },

  async validate(input: { dbUrl: string; adminEmail: string }) {
    try { await prisma.$queryRaw`SELECT 1`; }
    catch { throw AppError.badRequest('قاعدة البيانات غير متصلة', 'DB_DOWN'); }
    const exists = await prisma.user.findUnique({ where: { email: input.adminEmail } });
    if (exists) throw AppError.conflict('البريد مستخدم بالفعل', 'EMAIL_TAKEN');
    return { ok: true };
  },

  async run(input: { adminName: string; adminEmail: string; adminPassword: string; siteName: string; siteUrl: string }) {
    if (await checkDbFlag()) throw AppError.conflict('قاعدة البيانات مُنصّبة مسبقاً', 'DB_ALREADY_INSTALLED');
    const steps: Array<{ name: string; ok: boolean; message?: string }> = [];

    try {
      // Vercel: migrations تُشغّل مسبقاً في build command — لا exec هنا
      steps.push({ name: 'migrations', ok: true, message: 'pre-applied via build' });

      // تشغيل seed inline (بدون import ديناميكي)
      try {
        const { seedDatabase } = await import('../../../prisma/seed.vercel');
        await seedDatabase();
        steps.push({ name: 'seed', ok: true });
      } catch (e) {
        steps.push({ name: 'seed', ok: false, message: (e as Error).message });
        throw e;
      }

      const superRole = await prisma.role.findUnique({ where: { name: 'super_admin' } });
      if (!superRole) throw new Error('super_admin role missing after seed');

      const passwordHash = await hashPassword(input.adminPassword);
      await prisma.user.upsert({
        where: { email: input.adminEmail },
        update: { name: input.adminName, passwordHash, type: 'SUPER_ADMIN', status: 'ACTIVE', emailVerified: true, roleId: superRole.id },
        create: { email: input.adminEmail, name: input.adminName, passwordHash, type: 'SUPER_ADMIN', status: 'ACTIVE', emailVerified: true, roleId: superRole.id },
      });
      steps.push({ name: 'admin', ok: true });

      await prisma.systemSetting.upsert({ where: { key: 'site.name' }, update: { value: input.siteName }, create: { key: 'site.name', value: input.siteName, group: 'general' } });
      await prisma.systemSetting.upsert({ where: { key: 'site.url' }, update: { value: input.siteUrl }, create: { key: 'site.url', value: input.siteUrl, group: 'general' } });
      steps.push({ name: 'settings', ok: true });

      await prisma.systemSetting.upsert({ where: { key: 'app.installed' }, update: { value: 'true' }, create: { key: 'app.installed', value: 'true', group: 'env' } });
      await prisma.systemSetting.upsert({ where: { key: 'app.installedAt' }, update: { value: new Date().toISOString() }, create: { key: 'app.installedAt', value: new Date().toISOString(), group: 'env' } });
      steps.push({ name: 'db_flag', ok: true });

      logger.info({ email: input.adminEmail }, '✅ install complete (vercel)');
      return { ok: true, steps };
    } catch (e) {
      logger.error({ err: (e as Error).message, steps }, '❌ install failed');
      throw AppError.internal(`فشل التنصيب: ${(e as Error).message}`, 'INSTALL_FAILED');
    }
  },

  async emergency(_input: { key: string; confirm: string; adminEmail: string; adminPassword: string }) {
    throw AppError.forbidden('Emergency install غير مدعوم على Vercel — استخدم prisma studio', 'NOT_SUPPORTED');
  },
};

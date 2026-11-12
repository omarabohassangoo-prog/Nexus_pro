import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { hashPassword } from '../utils/password';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);
const LOCK_PATH = path.resolve(process.cwd(), '.install.lock');

async function checkLockFile(): Promise<boolean> { try { await fs.access(LOCK_PATH); return true; } catch { return false; } }
async function checkDbFlag(): Promise<boolean> { try { const s = await prisma.systemSetting.findUnique({ where: { key: 'app.installed' } }); return s?.value === 'true'; } catch { return false; } }
function checkEnvFlag(): boolean { return process.env.INSTALL_LOCKED === 'true'; }

export async function isInstalled(): Promise<boolean> {
  const [fileLock, dbLock] = await Promise.all([checkLockFile(), checkDbFlag()]);
  return fileLock && dbLock && checkEnvFlag();
}

export interface RequirementCheck { key: string; label: string; ok: boolean; current: string; required: string; }

export const installService = {
  async status() { return { installed: await isInstalled(), lockFile: await checkLockFile(), dbFlag: await checkDbFlag(), envFlag: checkEnvFlag() }; },

  async requirements(): Promise<{ ok: boolean; checks: RequirementCheck[] }> {
    const checks: RequirementCheck[] = [];
    const nodeVersion = process.version.replace(/^v/, '');
    checks.push({ key: 'node', label: 'Node.js', ok: parseInt(nodeVersion.split('.')[0]!) >= 18, current: nodeVersion, required: '≥18' });
    checks.push({ key: 'platform', label: 'المنصة', ok: true, current: os.platform(), required: 'any' });
    const freeMemMB = Math.round(os.freemem() / 1024 / 1024);
    checks.push({ key: 'memory', label: 'الذاكرة الحرة', ok: freeMemMB >= 256, current: `${freeMemMB}MB`, required: '≥256MB' });
    checks.push({ key: 'jwt', label: 'JWT_SECRET', ok: (process.env.JWT_SECRET?.length ?? 0) >= 32, current: `${process.env.JWT_SECRET?.length ?? 0} chars`, required: '≥32' });
    checks.push({ key: 'refresh', label: 'REFRESH_TOKEN_SECRET', ok: (process.env.REFRESH_TOKEN_SECRET?.length ?? 0) >= 32, current: `${process.env.REFRESH_TOKEN_SECRET?.length ?? 0} chars`, required: '≥32' });
    checks.push({ key: 'enc', label: 'ENCRYPTION_KEY', ok: /^[0-9a-f]{64}$/i.test(process.env.ENCRYPTION_KEY ?? ''), current: `${process.env.ENCRYPTION_KEY?.length ?? 0} chars`, required: '64 hex' });
    checks.push({ key: 'dburl', label: 'DATABASE_URL', ok: !!process.env.DATABASE_URL, current: process.env.DATABASE_URL ? 'set' : 'missing', required: 'set' });
    try { const t = Date.now(); await prisma.$queryRaw`SELECT 1`; checks.push({ key: 'db', label: 'قاعدة البيانات', ok: true, current: `connected (${Date.now() - t}ms)`, required: 'connected' }); }
    catch { checks.push({ key: 'db', label: 'قاعدة البيانات', ok: false, current: 'disconnected', required: 'connected' }); }
    for (const dir of ['uploads', 'backups', 'prisma']) {
      try { await fs.mkdir(path.resolve(process.cwd(), dir), { recursive: true }); checks.push({ key: `dir_${dir}`, label: `مجلد ${dir}`, ok: true, current: 'writable', required: 'writable' }); }
      catch { checks.push({ key: `dir_${dir}`, label: `مجلد ${dir}`, ok: false, current: 'unwritable', required: 'writable' }); }
    }
    try { const { stdout } = await execAsync('npx prisma --version'); checks.push({ key: 'prisma', label: 'Prisma CLI', ok: stdout.includes('prisma'), current: 'available', required: 'available' }); }
    catch { checks.push({ key: 'prisma', label: 'Prisma CLI', ok: false, current: 'missing', required: 'available' }); }
    const st = await installService.status();
    checks.push({ key: 'not_installed', label: 'لم يتم التنصيب سابقاً', ok: !st.installed, current: st.installed ? 'installed' : 'ready', required: 'ready' });
    try { const tf = path.resolve(process.cwd(), 'uploads', '.write-test'); await fs.writeFile(tf, 'ok'); await fs.unlink(tf); checks.push({ key: 'write', label: 'اختبار الكتابة', ok: true, current: 'ok', required: 'ok' }); }
    catch { checks.push({ key: 'write', label: 'اختبار الكتابة', ok: false, current: 'fail', required: 'ok' }); }
    return { ok: checks.every(c => c.ok), checks };
  },

  async validate(input: { dbUrl: string; adminEmail: string }) {
    try { await prisma.$queryRaw`SELECT 1`; } catch { throw AppError.badRequest('قاعدة البيانات غير متصلة', 'DB_DOWN'); }
    const exists = await prisma.user.findUnique({ where: { email: input.adminEmail } });
    if (exists) throw AppError.conflict('البريد مستخدم بالفعل', 'EMAIL_TAKEN');
    return { ok: true };
  },

  async run(input: { adminName: string; adminEmail: string; adminPassword: string; siteName: string; siteUrl: string; }) {
    if (await checkLockFile()) throw AppError.conflict('التنصيب مكتمل مسبقاً', 'ALREADY_INSTALLED');
    if (await checkDbFlag()) throw AppError.conflict('قاعدة البيانات مُنصّبة مسبقاً', 'DB_ALREADY_INSTALLED');
    const steps: Array<{ name: string; ok: boolean; message?: string }> = [];
    try {
      try { await execAsync('npx prisma migrate deploy'); steps.push({ name: 'migrations', ok: true }); }
      catch (e) { steps.push({ name: 'migrations', ok: false, message: (e as Error).message }); throw e; }
      try { await import('../../prisma/seed'); steps.push({ name: 'seed', ok: true }); }
      catch (e) { steps.push({ name: 'seed', ok: false, message: (e as Error).message }); throw e; }
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
      await fs.writeFile(LOCK_PATH, JSON.stringify({ installedAt: new Date().toISOString(), email: input.adminEmail }, null, 2));
      steps.push({ name: 'lock_file', ok: true });
      logger.info({ email: input.adminEmail }, '✅ install complete');
      return { ok: true, steps };
    } catch (e) {
      logger.error({ err: (e as Error).message, steps }, '❌ install failed');
      throw AppError.internal(`فشل التنصيب: ${(e as Error).message}`, 'INSTALL_FAILED');
    }
  },

  async emergency(input: { key: string; confirm: string; adminEmail: string; adminPassword: string }) {
    if (!process.env.INSTALL_KEY) throw AppError.forbidden('INSTALL_KEY غير مُعد', 'NO_INSTALL_KEY');
    if (input.key !== process.env.INSTALL_KEY) throw AppError.forbidden('مفتاح خاطئ', 'BAD_INSTALL_KEY');
    if (input.confirm !== 'RESET') throw AppError.badRequest('اكتب RESET للتأكيد', 'CONFIRM_REQUIRED');
    try { await fs.unlink(LOCK_PATH); } catch { /* ignore */ }
    await prisma.systemSetting.updateMany({ where: { key: 'app.installed' }, data: { value: 'false' } });
    return installService.run({ adminName: 'Super Admin', adminEmail: input.adminEmail, adminPassword: input.adminPassword, siteName: 'NEXUS', siteUrl: process.env.APP_URL ?? 'http://localhost:4000' });
  },
};

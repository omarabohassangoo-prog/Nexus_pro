import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const LOCK_PATH = path.resolve(process.cwd(), '.install.lock');

const TABLES_IN_ORDER = [
  'chatMessage', 'chatParticipant', 'chat',
  'templatePreview', 'templateUsage', 'templateVersion', 'template',
  'passwordResetToken', 'emailVerificationToken', 'loginHistory',
  'session', 'notification', 'auditLog', 'mediaFile', 'payment',
  'translation', 'language', 'page', 'systemSetting', 'backup',
  'rolePermission', 'user', 'permission', 'role',
] as const;

function ask(q: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(q, ans => { rl.close(); resolve(ans); }));
}

async function main() {
  console.log('\n⚠️  FACTORY RESET — سيتم حذف كل البيانات نهائياً!');
  console.log('اكتب "RESET" للتأكيد:');
  const confirm = await ask('> ');
  if (confirm !== 'RESET') { console.log('❌ ألغيت'); process.exit(1); }

  const email = await ask('البريد الجديد للمدير: ');
  const password = await ask('كلمة المرور: ');
  if (password.length < 8) { console.log('❌ كلمة المرور قصيرة'); process.exit(1); }

  console.log('\n🗑️  حذف البيانات...');
  for (const t of TABLES_IN_ORDER) {
    try {
      await (prisma as unknown as Record<string, { deleteMany: () => Promise<unknown> }>)[t].deleteMany();
      console.log(`  ✓ ${t}`);
    } catch (e) { console.log(`  ✗ ${t}: ${(e as Error).message}`); }
  }

  console.log('\n🌱 تشغيل seed...');
  await import('../prisma/seed');

  console.log('\n👤 إنشاء مدير جديد...');
  const superRole = await prisma.role.findUnique({ where: { name: 'super_admin' } });
  if (!superRole) throw new Error('super_admin role missing');
  await prisma.user.create({
    data: {
      email, passwordHash: await bcrypt.hash(password, 12),
      name: 'Super Admin', type: 'SUPER_ADMIN', status: 'ACTIVE',
      emailVerified: true, roleId: superRole.id,
    },
  });

  console.log('\n🔓 إزالة قفل التنصيب...');
  try { await fs.unlink(LOCK_PATH); } catch { /* ignore */ }
  await prisma.systemSetting.upsert({
    where: { key: 'app.installed' },
    update: { value: 'false' },
    create: { key: 'app.installed', value: 'false', group: 'env' },
  });

  console.log('\n✅ اكتمل Factory Reset');
  console.log(`   المدير: ${email}`);
  console.log('   أعد تشغيل الخادم ثم زر /install');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

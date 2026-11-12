// ═══════════════════════════════════════════════════════
// Seed Vercel-compatible (exportable للاستخدام من install)
// ═══════════════════════════════════════════════════════
import { PrismaClient, UserType, UserStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PERMISSIONS = [
  { key: 'users.read', group: 'users' }, { key: 'users.create', group: 'users' },
  { key: 'users.update', group: 'users' }, { key: 'users.delete', group: 'users' },
  { key: 'users.suspend', group: 'users' }, { key: 'users.export', group: 'users' },
  { key: 'roles.read', group: 'roles' }, { key: 'roles.create', group: 'roles' },
  { key: 'roles.update', group: 'roles' }, { key: 'roles.delete', group: 'roles' },
  { key: 'roles.assign', group: 'roles' },
  { key: 'pages.read', group: 'pages' }, { key: 'pages.create', group: 'pages' },
  { key: 'pages.update', group: 'pages' }, { key: 'pages.delete', group: 'pages' },
  { key: 'pages.publish', group: 'pages' },
  { key: 'settings.read', group: 'settings' }, { key: 'settings.update', group: 'settings' },
  { key: 'settings.manage_secrets', group: 'settings' },
  { key: 'notifications.read', group: 'notifications' }, { key: 'notifications.create', group: 'notifications' },
  { key: 'notifications.send', group: 'notifications' }, { key: 'notifications.delete', group: 'notifications' },
  { key: 'templates.read', group: 'templates' }, { key: 'templates.manage', group: 'templates' },
  { key: 'media.read', group: 'media' }, { key: 'media.upload', group: 'media' }, { key: 'media.delete', group: 'media' },
  { key: 'backups.read', group: 'backups' }, { key: 'backups.create', group: 'backups' },
  { key: 'backups.restore', group: 'backups' }, { key: 'backups.delete', group: 'backups' },
  { key: 'audit.read', group: 'audit' }, { key: 'audit.export', group: 'audit' },
  { key: 'system.read', group: 'system' }, { key: 'system.reset', group: 'system' }, { key: 'system.health', group: 'system' },
  { key: 'services.read', group: 'services' }, { key: 'services.configure', group: 'services' },
  { key: 'services.test', group: 'services' }, { key: 'services.enable', group: 'services' }, { key: 'services.disable', group: 'services' },
];

const ROLES = [
  { name: 'super_admin', isSystem: true, scope: 'ALL' },
  { name: 'admin', isSystem: true, scope: 'ALL_EXCEPT_RESET' },
  { name: 'editor', isSystem: true, scope: ['pages.read', 'pages.create', 'pages.update', 'pages.delete', 'templates.read', 'templates.manage', 'media.read', 'media.upload', 'media.delete'] },
  { name: 'user', isSystem: true, scope: [] },
];

const PAGES = [
  { slug: 'home', title: 'الرئيسية', content: '<h1>مرحباً</h1>', showInNav: true, showInFooter: false, navOrder: 1 },
  { slug: 'about', title: 'من نحن', content: '<p>...</p>', showInNav: true, showInFooter: true, navOrder: 2 },
  { slug: 'services', title: 'الخدمات', content: '<p>...</p>', showInNav: true, showInFooter: true, navOrder: 3 },
  { slug: 'faq', title: 'الأسئلة الشائعة', content: '<p>...</p>', showInNav: true, showInFooter: true, navOrder: 4 },
  { slug: 'terms', title: 'الشروط', content: '<p>...</p>', showInNav: false, showInFooter: true, navOrder: 5, isSystem: true },
  { slug: 'privacy', title: 'الخصوصية', content: '<p>...</p>', showInNav: false, showInFooter: true, navOrder: 6, isSystem: true },
];

const SETTINGS = [
  { key: 'site.name', value: 'NEXUS', group: 'general' },
  { key: 'site.logo', value: '', group: 'general' },
  { key: 'site.primaryColor', value: '#0ea5e9', group: 'general' },
  { key: 'site.secondaryColor', value: '#8b5cf6', group: 'general' },
  { key: 'site.description', value: 'منصة مؤسسية متكاملة', group: 'general' },
  { key: 'site.contactEmail', value: 'admin@nexus.local', group: 'general' },
  { key: 'admin.redirectAfterLoginByType', value: JSON.stringify({ SUPER_ADMIN: '/admin', ADMIN: '/admin', EDITOR: '/admin', USER: '/user' }), group: 'general' },
  { key: 'email.host', value: '', group: 'email' },
  { key: 'email.port', value: '587', group: 'email' },
  { key: 'email.user', value: '', group: 'email' },
  { key: 'email.pass', value: '', group: 'email', isSecret: true },
  { key: 'email.from', value: 'noreply@nexus.local', group: 'email' },
  { key: 'email.secure', value: 'false', group: 'email' },
  { key: 'sms.twilioSid', value: '', group: 'sms' },
  { key: 'sms.twilioToken', value: '', group: 'sms', isSecret: true },
  { key: 'whatsapp.token', value: '', group: 'whatsapp', isSecret: true },
  { key: 'paypal.mode', value: 'sandbox', group: 'paypal' },
  { key: 'paypal.clientId', value: '', group: 'paypal' },
  { key: 'paypal.secret', value: '', group: 'paypal', isSecret: true },
  { key: 'files.storage', value: 'vercel-blob', group: 'files' },
  { key: 'files.maxSizeMB', value: '10', group: 'files' },
  { key: 'files.allowedMimes', value: 'image/jpeg,image/png,image/webp,application/pdf', group: 'files' },
  { key: 'i18n.defaultLang', value: 'ar', group: 'i18n' },
  { key: 'i18n.enabled', value: 'ar,en', group: 'i18n' },
  { key: 'app.installed', value: 'false', group: 'env' },
  { key: 'app.installedAt', value: '', group: 'env' },
];

export async function seedDatabase() {
  for (const p of PERMISSIONS) {
    await prisma.permission.upsert({ where: { key: p.key }, update: { group: p.group }, create: p });
  }
  for (const r of ROLES) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { isSystem: r.isSystem },
      create: { name: r.name, isSystem: r.isSystem, description: r.name },
    });
    let keys: string[] = [];
    if (r.scope === 'ALL') keys = PERMISSIONS.map(p => p.key);
    else if (r.scope === 'ALL_EXCEPT_RESET') keys = PERMISSIONS.map(p => p.key).filter(k => k !== 'system.reset');
    else keys = r.scope as string[];
    const perms = await prisma.permission.findMany({ where: { key: { in: keys } } });
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({ data: perms.map(p => ({ roleId: role.id, permissionId: p.id })), skipDuplicates: true });
  }

  const superRole = await prisma.role.findUnique({ where: { name: 'super_admin' } });
  const adminEmail = 'admin@nexus.local';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash('ChangeMe123!', 12),
        name: 'Super Admin', type: UserType.SUPER_ADMIN, status: UserStatus.ACTIVE,
        emailVerified: true, roleId: superRole?.id,
      },
    });
  }

  for (const pg of PAGES) {
    await prisma.page.upsert({
      where: { slug: pg.slug },
      update: {},
      create: { ...pg, isSystem: (pg as { isSystem?: boolean }).isSystem ?? false },
    });
  }

  for (const s of SETTINGS) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { group: s.group },
      create: { key: s.key, value: s.value, group: s.group, isSecret: (s as { isSecret?: boolean }).isSecret ?? false },
    });
  }

  await prisma.language.upsert({ where: { code: 'ar' }, update: {}, create: { code: 'ar', name: 'العربية', direction: 'rtl', isDefault: true, isActive: true } });
  await prisma.language.upsert({ where: { code: 'en' }, update: {}, create: { code: 'en', name: 'English', direction: 'ltr', isDefault: false, isActive: true } });

  console.log('✅ Vercel seed complete');
}

// CLI entry (لا يعمل على Vercel، فقط محلياً)
if (require.main === module) {
  seedDatabase()
    .then(() => prisma.$disconnect())
    .catch(e => { console.error(e); process.exit(1); });
}

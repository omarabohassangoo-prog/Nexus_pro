import { PrismaClient } from '@prisma/client';
import { UserType, TemplateType, UserStatus } from '../src/constants/enums';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PERMISSIONS: Array<{ key: string; group: string; description: string }> = [
  { key: 'users.read', group: 'users', description: 'عرض المستخدمين' },
  { key: 'users.create', group: 'users', description: 'إنشاء مستخدم' },
  { key: 'users.update', group: 'users', description: 'تعديل مستخدم' },
  { key: 'users.delete', group: 'users', description: 'حذف مستخدم' },
  { key: 'users.suspend', group: 'users', description: 'تعليق مستخدم' },
  { key: 'users.export', group: 'users', description: 'تصدير المستخدمين' },
  { key: 'roles.read', group: 'roles', description: 'عرض الأدوار' },
  { key: 'roles.create', group: 'roles', description: 'إنشاء دور' },
  { key: 'roles.update', group: 'roles', description: 'تعديل دور' },
  { key: 'roles.delete', group: 'roles', description: 'حذف دور' },
  { key: 'roles.assign', group: 'roles', description: 'تعيين صلاحيات' },
  { key: 'pages.read', group: 'pages', description: 'عرض الصفحات' },
  { key: 'pages.create', group: 'pages', description: 'إنشاء صفحة' },
  { key: 'pages.update', group: 'pages', description: 'تعديل صفحة' },
  { key: 'pages.delete', group: 'pages', description: 'حذف صفحة' },
  { key: 'pages.publish', group: 'pages', description: 'نشر صفحة' },
  { key: 'settings.read', group: 'settings', description: 'عرض الإعدادات' },
  { key: 'settings.update', group: 'settings', description: 'تعديل الإعدادات' },
  { key: 'settings.manage_secrets', group: 'settings', description: 'إدارة الأسرار' },
  { key: 'notifications.read', group: 'notifications', description: 'عرض الإشعارات' },
  { key: 'notifications.create', group: 'notifications', description: 'إنشاء إشعار' },
  { key: 'notifications.send', group: 'notifications', description: 'إرسال إشعار' },
  { key: 'notifications.delete', group: 'notifications', description: 'حذف إشعار' },
  { key: 'templates.read', group: 'templates', description: 'عرض القوالب' },
  { key: 'templates.manage', group: 'templates', description: 'إدارة القوالب' },
  { key: 'media.read', group: 'media', description: 'عرض الملفات' },
  { key: 'media.upload', group: 'media', description: 'رفع ملف' },
  { key: 'media.delete', group: 'media', description: 'حذف ملف' },
  { key: 'backups.read', group: 'backups', description: 'عرض النسخ' },
  { key: 'backups.create', group: 'backups', description: 'إنشاء نسخة' },
  { key: 'backups.restore', group: 'backups', description: 'استعادة نسخة' },
  { key: 'backups.delete', group: 'backups', description: 'حذف نسخة' },
  { key: 'audit.read', group: 'audit', description: 'عرض السجل' },
  { key: 'audit.export', group: 'audit', description: 'تصدير السجل' },
  { key: 'system.read', group: 'system', description: 'عرض النظام' },
  { key: 'system.reset', group: 'system', description: 'إعادة تعيين النظام' },
  { key: 'system.health', group: 'system', description: 'فحص الصحة' },
  { key: 'services.read', group: 'services', description: 'عرض الخدمات' },
  { key: 'services.configure', group: 'services', description: 'إعداد الخدمات' },
  { key: 'services.test', group: 'services', description: 'اختبار الخدمات' },
  { key: 'services.enable', group: 'services', description: 'تفعيل الخدمات' },
  { key: 'services.disable', group: 'services', description: 'تعطيل الخدمات' },
];

const ROLES: Array<{ name: string; description: string; isSystem: boolean; permissions: string[] | 'ALL' | 'ALL_EXCEPT_RESET' }> = [
  { name: 'super_admin', description: 'مدير عام', isSystem: true, permissions: 'ALL' },
  { name: 'admin', description: 'مدير', isSystem: true, permissions: 'ALL_EXCEPT_RESET' },
  { name: 'editor', description: 'محرر', isSystem: true, permissions: ['pages.read', 'pages.create', 'pages.update', 'pages.delete', 'templates.read', 'templates.manage', 'media.read', 'media.upload', 'media.delete'] },
  { name: 'user', description: 'مستخدم', isSystem: true, permissions: [] },
];

const PAGES = [
  { slug: 'home', title: 'الرئيسية', content: '<h1>مرحباً</h1>', metaTitle: 'NEXUS', metaDescription: 'منصة مؤسسية متكاملة', showInNav: true, showInFooter: false, navOrder: 1, isSystem: false, requiresAuth: false },
  { slug: 'about', title: 'من نحن', content: '<p>...</p>', metaTitle: 'من نحن', showInNav: true, showInFooter: true, navOrder: 2, isSystem: false, requiresAuth: false },
  { slug: 'services', title: 'الخدمات', content: '<p>...</p>', showInNav: true, showInFooter: true, navOrder: 3, isSystem: false, requiresAuth: false },
  { slug: 'faq', title: 'الأسئلة الشائعة', content: '<p>...</p>', showInNav: true, showInFooter: true, navOrder: 4, isSystem: false, requiresAuth: false },
  { slug: 'terms', title: 'الشروط والأحكام', content: '<p>...</p>', showInNav: false, showInFooter: true, navOrder: 5, isSystem: true, requiresAuth: false },
  { slug: 'privacy', title: 'سياسة الخصوصية', content: '<p>...</p>', showInNav: false, showInFooter: true, navOrder: 6, isSystem: true, requiresAuth: false },
];

const TEMPLATES: Array<{ key: string; name: string; type: TemplateType; subject: string; body: string; variables: string[] }> = [
  { key: 'welcome_user', name: 'ترحيب مستخدم', type: 'EMAIL', subject: 'مرحباً {{name}}', body: '<h1>مرحباً {{name}}</h1><p>شكراً لتسجيلك</p>', variables: ['name', 'email'] },
  { key: 'verify_email', name: 'تحقق البريد', type: 'EMAIL', subject: 'تحقق من بريدك', body: '<p>اضغط: <a href="{{link}}">تحقق</a></p>', variables: ['name', 'link'] },
  { key: 'reset_password', name: 'إعادة تعيين', type: 'EMAIL', subject: 'إعادة تعيين كلمة المرور', body: '<p><a href="{{link}}">إعادة تعيين</a></p>', variables: ['name', 'link'] },
  { key: 'password_changed', name: 'تم تغيير كلمة المرور', type: 'EMAIL', subject: 'تغيير كلمة المرور', body: '<p>تم تغيير كلمة المرور في {{time}}</p>', variables: ['name', 'time'] },
  { key: 'login_alert', name: 'تنبيه دخول', type: 'EMAIL', subject: 'دخول جديد', body: '<p>دخول من {{ip}} في {{time}}</p>', variables: ['name', 'ip', 'time'] },
  { key: 'account_locked', name: 'قفل الحساب', type: 'EMAIL', subject: 'قفل الحساب', body: '<p>تم قفل الحساب بعد 5 محاولات</p>', variables: ['name'] },
  { key: 'account_activated', name: 'تنشيط الحساب', type: 'EMAIL', subject: 'تنشيط ناجح', body: '<p>مرحباً {{name}}</p>', variables: ['name'] },
  { key: 'invoice', name: 'فاتورة', type: 'EMAIL', subject: 'فاتورة #{{number}}', body: '<p>المبلغ: {{amount}}</p>', variables: ['number', 'amount', 'customer'] },
  { key: 'payment_receipt', name: 'إيصال دفع', type: 'EMAIL', subject: 'إيصال دفع', body: '<p>تم استلام {{amount}}</p>', variables: ['amount', 'date'] },
  { key: 'otp_login', name: 'OTP دخول', type: 'SMS', subject: '', body: 'رمزك: {{code}}', variables: ['code'] },
  { key: 'otp_reset', name: 'OTP إعادة تعيين', type: 'SMS', subject: '', body: 'رمز إعادة التعيين: {{code}}', variables: ['code'] },
  { key: 'payment_confirmed', name: 'تأكيد دفع SMS', type: 'SMS', subject: '', body: 'تم تأكيد دفعتك', variables: ['amount'] },
  { key: 'welcome_whatsapp', name: 'ترحيب WhatsApp', type: 'WHATSAPP', subject: '', body: 'مرحباً {{name}}!', variables: ['name'] },
  { key: 'order_update_whatsapp', name: 'تحديث طلب WhatsApp', type: 'WHATSAPP', subject: '', body: 'حالة طلبك: {{status}}', variables: ['status'] },
  { key: 'new_message_notification', name: 'إشعار رسالة', type: 'NOTIFICATION', subject: '', body: '{{sender}} أرسل لك رسالة', variables: ['sender'] },
  { key: 'system_alert', name: 'تنبيه نظام', type: 'NOTIFICATION', subject: '', body: '{{message}}', variables: ['message'] },
  { key: 'backup_completed', name: 'نسخة احتياطية', type: 'NOTIFICATION', subject: '', body: 'اكتملت النسخة الاحتياطية', variables: [] },
];

const SETTINGS: Array<{ key: string; value: string; group: string; isSecret?: boolean }> = [
  { key: 'site.name', value: 'NEXUS', group: 'general' },
  { key: 'site.logo', value: '', group: 'general' },
  { key: 'site.primaryColor', value: '#0ea5e9', group: 'general' },
  { key: 'site.secondaryColor', value: '#8b5cf6', group: 'general' },
  { key: 'site.description', value: 'منصة مؤسسية متكاملة', group: 'general' },
  { key: 'site.contactEmail', value: 'admin@nexus.local', group: 'general' },
  { key: 'site.contactPhone', value: '+966500000000', group: 'general' },
  { key: 'admin.redirectAfterLoginByType', value: JSON.stringify({ SUPER_ADMIN: '/admin', ADMIN: '/admin', EDITOR: '/admin', USER: '/user' }), group: 'general' },
  { key: 'email.host', value: 'smtp.mailtrap.io', group: 'email' },
  { key: 'email.port', value: '587', group: 'email' },
  { key: 'email.user', value: '', group: 'email' },
  { key: 'email.pass', value: '', group: 'email', isSecret: true },
  { key: 'email.from', value: 'noreply@nexus.local', group: 'email' },
  { key: 'email.secure', value: 'false', group: 'email' },
  { key: 'sms.twilioSid', value: '', group: 'sms' },
  { key: 'sms.twilioToken', value: '', group: 'sms', isSecret: true },
  { key: 'sms.from', value: '', group: 'sms' },
  { key: 'whatsapp.token', value: '', group: 'whatsapp', isSecret: true },
  { key: 'whatsapp.phoneId', value: '', group: 'whatsapp' },
  { key: 'whatsapp.verifyToken', value: '', group: 'whatsapp', isSecret: true },
  { key: 'paypal.mode', value: 'sandbox', group: 'paypal' },
  { key: 'paypal.clientId', value: '', group: 'paypal' },
  { key: 'paypal.secret', value: '', group: 'paypal', isSecret: true },
  { key: 'files.storage', value: 'local', group: 'files' },
  { key: 'files.maxSizeMB', value: '10', group: 'files' },
  { key: 'files.allowedMimes', value: 'image/jpeg,image/png,image/webp,application/pdf', group: 'files' },
  { key: 'i18n.defaultLang', value: 'ar', group: 'i18n' },
  { key: 'i18n.enabled', value: 'ar,en', group: 'i18n' },
  { key: 'css.fontFamily', value: 'Tajawal, sans-serif', group: 'css' },
  { key: 'app.installed', value: 'false', group: 'env' },
  { key: 'app.installedAt', value: '', group: 'env' },
];

async function main() {
  console.log('🌱 Seeding...');
  for (const p of PERMISSIONS) {
    await prisma.permission.upsert({ where: { key: p.key }, update: { group: p.group, description: p.description }, create: p });
  }
  console.log(`✅ ${PERMISSIONS.length} permissions`);
  for (const r of ROLES) {
    const role = await prisma.role.upsert({ where: { name: r.name }, update: { description: r.description, isSystem: r.isSystem }, create: { name: r.name, description: r.description, isSystem: r.isSystem } });
    let permKeys: string[] = [];
    if (r.permissions === 'ALL') permKeys = PERMISSIONS.map(p => p.key);
    else if (r.permissions === 'ALL_EXCEPT_RESET') permKeys = PERMISSIONS.map(p => p.key).filter(k => k !== 'system.reset');
    else permKeys = r.permissions;
    const perms = await prisma.permission.findMany({ where: { key: { in: permKeys } } });
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({ data: perms.map(p => ({ roleId: role.id, permissionId: p.id })) });
  }
  console.log(`✅ ${ROLES.length} roles`);
  const superRole = await prisma.role.findUnique({ where: { name: 'super_admin' } });
  const adminEmail = 'admin@nexus.local';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    await prisma.user.create({ data: { email: adminEmail, passwordHash: await bcrypt.hash('ChangeMe123!', 12), name: 'Super Admin', type: UserType.SUPER_ADMIN, status: UserStatus.ACTIVE, emailVerified: true, roleId: superRole?.id } });
    console.log('✅ super admin created (admin@nexus.local / ChangeMe123!)');
  }
  for (const pg of PAGES) { await prisma.page.upsert({ where: { slug: pg.slug }, update: {}, create: pg }); }
  console.log(`✅ ${PAGES.length} pages`);
  for (const t of TEMPLATES) {
    await prisma.template.upsert({ where: { key: t.key }, update: { name: t.name, type: t.type, subject: t.subject, body: t.body, variables: JSON.stringify(t.variables), isSystem: true }, create: { key: t.key, name: t.name, type: t.type, subject: t.subject, body: t.body, variables: JSON.stringify(t.variables), isSystem: true } });
  }
  console.log(`✅ ${TEMPLATES.length} templates`);
  for (const s of SETTINGS) {
    await prisma.systemSetting.upsert({ where: { key: s.key }, update: { group: s.group, isSecret: s.isSecret ?? false }, create: { key: s.key, value: s.value, group: s.group, isSecret: s.isSecret ?? false } });
  }
  console.log(`✅ ${SETTINGS.length} settings`);
  await prisma.language.upsert({ where: { code: 'ar' }, update: {}, create: { code: 'ar', name: 'العربية', direction: 'rtl', isDefault: true, isActive: true } });
  await prisma.language.upsert({ where: { code: 'en' }, update: {}, create: { code: 'en', name: 'English', direction: 'ltr', isDefault: false, isActive: true } });
  console.log('✅ 2 languages');
  console.log('🎉 Seed complete!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

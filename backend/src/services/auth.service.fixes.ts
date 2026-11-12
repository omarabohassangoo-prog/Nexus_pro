// ═══════════════════════════════════════════════════════
// استبدل الدوال التالية في backend/src/services/auth.service.ts
// ═══════════════════════════════════════════════════════

import { randomToken, sha256 } from '../utils/crypto';
import { hashPassword } from '../utils/password';
import { AppError } from '../utils/AppError';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { emailService } from './external/email.service';
import { logger } from '../utils/logger';

const RESET_TTL_MS = 60 * 60 * 1000;          // ساعة
const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;    // 24 ساعة

// ── register: إنشاء token تحقق حقيقي ──
export async function registerWithVerification(input: { email: string; password: string; name: string; phone?: string; type: 'USER' | 'EDITOR' }) {
  const exists = await prisma.user.findUnique({ where: { email: input.email } });
  if (exists) throw AppError.conflict('البريد مستخدم', 'EMAIL_TAKEN');

  const defaultRole = await prisma.role.findUnique({ where: { name: 'user' } });
  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email, passwordHash, name: input.name, phone: input.phone,
      type: input.type === 'EDITOR' ? 'EDITOR' : 'USER', status: 'PENDING',
      roleId: defaultRole?.id ?? null,
    },
  });

  const rawToken = randomToken(32);
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256(rawToken),
      expiresAt: new Date(Date.now() + VERIFY_TTL_MS),
    },
  });

  const link = `${env.FRONTEND_URL}/activate?token=${rawToken}`;
  await emailService.sendTemplate('verify_email', user.email, { name: user.name, link }, { userId: user.id }).catch(err => {
    logger.error({ err, userId: user.id }, 'verify email send failed');
  });

  return { user };
}

// ── activate: تنشيط الحساب ──
export async function activateAccount(rawToken: string): Promise<void> {
  if (!rawToken || rawToken.length < 10) throw AppError.badRequest('رمز غير صالح', 'INVALID_TOKEN');

  const tokenHash = sha256(rawToken);
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record) throw AppError.badRequest('الرمز غير صالح', 'INVALID_TOKEN');
  if (record.usedAt) throw AppError.badRequest('الرمز مستخدم مسبقاً', 'TOKEN_USED');
  if (record.expiresAt < new Date()) throw AppError.badRequest('انتهت صلاحية الرمز', 'TOKEN_EXPIRED');

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { status: 'ACTIVE', emailVerified: true },
    }),
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  await emailService.sendTemplate('account_activated', record.user.email, { name: record.user.name }, { userId: record.userId }).catch(() => undefined);
  logger.info({ userId: record.userId }, 'account activated');
}

// ── forgotPassword: إنشاء token حقيقي ──
export async function requestPasswordReset(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.deletedAt) return; // لا نكشف وجود البريد

  const rawToken = randomToken(32);
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256(rawToken),
      expiresAt: new Date(Date.now() + RESET_TTL_MS),
    },
  });

  const link = `${env.FRONTEND_URL}/reset-password?token=${rawToken}`;
  await emailService.sendTemplate('reset_password', user.email, { name: user.name, link }, { userId: user.id }).catch(err => {
    logger.error({ err, userId: user.id }, 'reset email send failed');
  });
}

// ── resetPassword: تنفيذ إعادة التعيين ──
export async function resetPasswordWithToken(rawToken: string, newPassword: string): Promise<void> {
  if (!rawToken || rawToken.length < 10) throw AppError.badRequest('رمز غير صالح', 'INVALID_TOKEN');

  const tokenHash = sha256(rawToken);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record) throw AppError.badRequest('الرمز غير صالح', 'INVALID_TOKEN');
  if (record.usedAt) throw AppError.badRequest('الرمز مستخدم مسبقاً', 'TOKEN_USED');
  if (record.expiresAt < new Date()) throw AppError.badRequest('انتهت صلاحية الرمز', 'TOKEN_EXPIRED');

  const newHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: newHash, failedAttempts: 0, lockedUntil: null },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.session.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  await emailService.sendTemplate('password_changed', record.user.email, { name: record.user.name, time: new Date().toISOString() }, { userId: record.userId }).catch(() => undefined);
  logger.info({ userId: record.userId }, 'password reset complete');
}

// ── loginHistory: تسجيل محاولات الدخول ──
export async function recordLoginAttempt(userId: number, success: boolean, meta: { ip?: string; ua?: string; reason?: string }): Promise<void> {
  await prisma.loginHistory.create({
    data: { userId, success, ipAddress: meta.ip, userAgent: meta.ua, reason: meta.reason },
  }).catch(() => undefined);
}

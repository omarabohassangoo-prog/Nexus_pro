import { UserStatus, UserType } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { hashPassword, verifyPassword } from '../utils/password';
import { signAccess, signRefresh, verifyRefresh, TTL } from '../utils/jwt';
import { randomToken, sha256 } from '../utils/crypto';
import { logger } from '../utils/logger';
import type { RegisterInput, LoginInput } from '../schemas/auth.schema';
import type { SafeUser } from '../types/user.types';
import type { LoginResult } from '../types/auth.types';

const MAX_FAILED = 5;
const LOCK_MS = 15 * 60 * 1000;

function toSafeUser(u: { id: number; email: string; name: string; phone: string | null; avatarUrl: string | null; type: UserType; status: UserStatus; emailVerified: boolean; language: string; roleId: number | null; lastLoginAt: Date | null; createdAt: Date; }): SafeUser {
  return { id: u.id, email: u.email, name: u.name, phone: u.phone, avatarUrl: u.avatarUrl, type: u.type, status: u.status, emailVerified: u.emailVerified, language: u.language, roleId: u.roleId, lastLoginAt: u.lastLoginAt, createdAt: u.createdAt };
}

async function resolveRedirectByType(type: UserType): Promise<string> {
  const setting = await prisma.systemSetting.findUnique({ where: { key: 'admin.redirectAfterLoginByType' } });
  const fallback: Record<UserType, string> = { SUPER_ADMIN: '/admin', ADMIN: '/admin', EDITOR: '/admin', USER: '/user' };
  if (!setting) return fallback[type];
  try { const map = JSON.parse(setting.value) as Record<string, string>; return map[type] ?? fallback[type]; }
  catch { return fallback[type]; }
}

export const authService = {
  async register(input: RegisterInput) {
    const exists = await prisma.user.findUnique({ where: { email: input.email } });
    if (exists) throw AppError.conflict('البريد مستخدم', 'EMAIL_TAKEN');
    const defaultRole = await prisma.role.findUnique({ where: { name: 'user' } });
    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: { email: input.email, passwordHash, name: input.name, phone: input.phone, type: input.type === 'EDITOR' ? UserType.EDITOR : UserType.USER, status: UserStatus.PENDING, roleId: defaultRole?.id ?? null },
    });
    const activationToken = randomToken(32);
    logger.info({ userId: user.id, activationToken: activationToken.slice(0, 8) + '...' }, 'activation token generated');
    return { user: toSafeUser(user) };
  },

  async login(input: LoginInput, meta: { ip?: string; ua?: string }): Promise<LoginResult> {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    const invalid = AppError.unauthorized('بيانات الدخول غير صحيحة', 'INVALID_CREDENTIALS');
    if (!user || user.deletedAt) throw invalid;
    if (user.lockedUntil && user.lockedUntil > new Date()) throw AppError.forbidden('الحساب مقفل مؤقتاً، حاول لاحقاً', 'ACCOUNT_LOCKED');

    const ok = await verifyPassword(input.password, user.passwordHash);
    if (!ok) {
      const attempts = user.failedAttempts + 1;
      const shouldLock = attempts >= MAX_FAILED;
      await prisma.user.update({ where: { id: user.id }, data: { failedAttempts: attempts, lockedUntil: shouldLock ? new Date(Date.now() + LOCK_MS) : null } });
      throw invalid;
    }

    if (user.status === UserStatus.PENDING) throw AppError.forbidden('الحساب غير مُفعّل', 'EMAIL_NOT_VERIFIED');
    if (user.status === UserStatus.SUSPENDED) throw AppError.forbidden('الحساب معلّق', 'ACCOUNT_SUSPENDED');

    await prisma.user.update({ where: { id: user.id }, data: { failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() } });

    const session = await prisma.session.create({
      data: { userId: user.id, refreshHash: sha256(randomToken(48)), ipAddress: meta.ip, userAgent: meta.ua, expiresAt: new Date(Date.now() + TTL.REFRESH * 1000) },
    });

    const accessToken = signAccess({ sub: user.id, email: user.email });
    const refreshJwt = signRefresh({ sub: user.id, email: user.email, sid: session.id });
    const redirectTo = await resolveRedirectByType(user.type);
    return { accessToken, refreshToken: refreshJwt, user: toSafeUser(user), redirectTo };
  },

  async refresh(refreshJwt: string): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: { sub: number; email: string; sid: string };
    try { payload = verifyRefresh(refreshJwt); }
    catch { throw AppError.unauthorized('refresh token غير صالح', 'INVALID_REFRESH'); }

    const session = await prisma.session.findUnique({ where: { id: payload.sid } });
    if (!session || session.revokedAt || session.expiresAt < new Date()) throw AppError.unauthorized('الجلسة منتهية', 'SESSION_EXPIRED');
    if (session.userId !== payload.sub) throw AppError.unauthorized('جلسة غير متطابقة', 'SESSION_MISMATCH');

    await prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
    const newSession = await prisma.session.create({
      data: { userId: session.userId, refreshHash: sha256(randomToken(48)), ipAddress: session.ipAddress, userAgent: session.userAgent, expiresAt: new Date(Date.now() + TTL.REFRESH * 1000) },
    });

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) throw AppError.unauthorized('مستخدم غير موجود', 'USER_GONE');

    const accessToken = signAccess({ sub: user.id, email: user.email });
    const newRefresh = signRefresh({ sub: user.id, email: user.email, sid: newSession.id });
    return { accessToken, refreshToken: newRefresh };
  },

  async logout(refreshJwt: string): Promise<void> {
    try { const payload = verifyRefresh(refreshJwt); await prisma.session.updateMany({ where: { id: payload.sid, revokedAt: null }, data: { revokedAt: new Date() } }); }
    catch { /* ignore */ }
  },

  async listSessions(userId: number) {
    return prisma.session.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      select: { id: true, ipAddress: true, userAgent: true, createdAt: true, expiresAt: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async revokeSession(userId: number, sessionId: string) {
    const s = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!s || s.userId !== userId) throw AppError.notFound('جلسة غير موجودة', 'SESSION_NOT_FOUND');
    await prisma.session.update({ where: { id: sessionId }, data: { revokedAt: new Date() } });
    const { realtimeService } = await import('../realtime/realtime.service');
    realtimeService.disconnectUser(userId, sessionId);
  },

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.notFound('مستخدم غير موجود');
    const ok = await verifyPassword(currentPassword, user.passwordHash);
    if (!ok) throw AppError.badRequest('كلمة المرور الحالية خاطئة', 'INVALID_PASSWORD');
    const newHash = await hashPassword(newPassword);
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } }),
      prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
  },

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return;
    const token = randomToken(32);
    logger.info({ userId: user.id, token: token.slice(0, 8) }, 'reset token');
  },

  async resetPassword(token: string, _newPassword: string) {
    if (!token || token.length < 10) throw AppError.badRequest('رمز غير صالح', 'INVALID_TOKEN');
    throw AppError.internal('سيُستكمل لاحقاً', 'NOT_IMPLEMENTED');
  },

  async activate(_token: string) {
    throw AppError.internal('سيُستكمل لاحقاً', 'NOT_IMPLEMENTED');
  },
};

import { Prisma, UserStatus, UserType } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { hashPassword } from '../utils/password';
import type { SafeUser } from '../types/user.types';
import type { CreateUserInput, UpdateUserInput, ListUsersQuery } from '../schemas/user.schema';
import { buildPaginationMeta } from '../utils/pagination';

function toSafe(u: { id: number; email: string; name: string; phone: string | null; avatarUrl: string | null; type: UserType; status: UserStatus; emailVerified: boolean; language: string; roleId: number | null; lastLoginAt: Date | null; createdAt: Date; }): SafeUser {
  return { id: u.id, email: u.email, name: u.name, phone: u.phone, avatarUrl: u.avatarUrl, type: u.type, status: u.status, emailVerified: u.emailVerified, language: u.language, roleId: u.roleId, lastLoginAt: u.lastLoginAt, createdAt: u.createdAt };
}

export const userService = {
  async list(q: ListUsersQuery) {
    const where: Prisma.UserWhereInput = { deletedAt: null };
    if (q.type) where.type = q.type;
    if (q.status) where.status = q.status;
    if (q.search) where.OR = [{ email: { contains: q.search } }, { name: { contains: q.search } }];
    const [total, rows] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({ where, skip: (q.page - 1) * q.pageSize, take: q.pageSize, orderBy: { [q.sortBy]: q.sortOrder } }),
    ]);
    return { items: rows.map(toSafe), meta: buildPaginationMeta(total, q.page, q.pageSize) };
  },

  async getById(id: number) {
    const u = await prisma.user.findUnique({ where: { id }, include: { role: true } });
    if (!u || u.deletedAt) throw AppError.notFound('مستخدم غير موجود');
    return { ...toSafe(u), role: u.role ? { id: u.role.id, name: u.role.name } : null };
  },

  async create(input: CreateUserInput) {
    const exists = await prisma.user.findUnique({ where: { email: input.email } });
    if (exists) throw AppError.conflict('البريد مستخدم', 'EMAIL_TAKEN');
    const u = await prisma.user.create({
      data: { email: input.email, passwordHash: await hashPassword(input.password), name: input.name, phone: input.phone, type: input.type, roleId: input.roleId, status: UserStatus.ACTIVE, emailVerified: true },
    });
    return toSafe(u);
  },

  async update(id: number, input: UpdateUserInput, actorId: number) {
    const u = await prisma.user.findUnique({ where: { id } });
    if (!u || u.deletedAt) throw AppError.notFound('مستخدم غير موجود');
    if (u.type === UserType.SUPER_ADMIN && id !== actorId) throw AppError.forbidden('لا يمكن تعديل super_admin آخر', 'PROTECTED_SUPER_ADMIN');
    const updated = await prisma.user.update({ where: { id }, data: input });
    return toSafe(updated);
  },

  async remove(id: number, actorId: number) {
    if (id === actorId) throw AppError.badRequest('لا يمكن حذف نفسك', 'CANNOT_DELETE_SELF');
    const u = await prisma.user.findUnique({ where: { id } });
    if (!u) throw AppError.notFound('مستخدم غير موجود');
    if (u.type === UserType.SUPER_ADMIN) throw AppError.forbidden('لا يمكن حذف super_admin', 'PROTECTED_SUPER_ADMIN');
    await prisma.user.update({ where: { id }, data: { deletedAt: new Date(), status: 'DELETED' } });
  },

  async suspend(id: number, actorId: number) {
    if (id === actorId) throw AppError.badRequest('لا يمكن تعليق نفسك', 'CANNOT_SUSPEND_SELF');
    const u = await prisma.user.findUnique({ where: { id } });
    if (!u) throw AppError.notFound('مستخدم غير موجود');
    if (u.type === UserType.SUPER_ADMIN) throw AppError.forbidden('لا يمكن تعليق super_admin');
    await prisma.user.update({ where: { id }, data: { status: UserStatus.SUSPENDED } });
  },

  async updateProfile(userId: number, input: { name?: string; phone?: string | null; language?: string }) {
    const u = await prisma.user.update({ where: { id: userId }, data: input });
    return toSafe(u);
  },
};

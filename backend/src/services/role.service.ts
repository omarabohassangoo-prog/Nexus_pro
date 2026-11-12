import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';

export const roleService = {
  async list() {
    return prisma.role.findMany({
      include: { permissions: { include: { permission: true } }, _count: { select: { users: true } } },
      orderBy: { id: 'asc' },
    });
  },

  async listPermissions() {
    return prisma.permission.findMany({ orderBy: [{ group: 'asc' }, { key: 'asc' }] });
  },

  async create(name: string, description?: string, permissionKeys?: string[]) {
    const exists = await prisma.role.findUnique({ where: { name } });
    if (exists) throw AppError.conflict('الدور موجود', 'ROLE_EXISTS');
    const perms = permissionKeys?.length ? await prisma.permission.findMany({ where: { key: { in: permissionKeys } } }) : [];
    return prisma.role.create({
      data: { name, description, isSystem: false, permissions: { create: perms.map(p => ({ permissionId: p.id })) } },
    });
  },

  async update(id: number, data: { name?: string; description?: string; permissionKeys?: string[] }) {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) throw AppError.notFound('الدور غير موجود');
    if (role.isSystem && data.name && data.name !== role.name) throw AppError.forbidden('لا يمكن تعديل اسم دور نظامي');

    await prisma.$transaction(async tx => {
      if (data.name || data.description !== undefined) {
        await tx.role.update({ where: { id }, data: { name: data.name, description: data.description } });
      }
      if (data.permissionKeys) {
        const perms = await tx.permission.findMany({ where: { key: { in: data.permissionKeys } } });
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
        await tx.rolePermission.createMany({ data: perms.map(p => ({ roleId: id, permissionId: p.id })) });
      }
    });
    return prisma.role.findUnique({ where: { id }, include: { permissions: { include: { permission: true } } } });
  },

  async remove(id: number) {
    const role = await prisma.role.findUnique({ where: { id }, include: { _count: { select: { users: true } } } });
    if (!role) throw AppError.notFound('الدور غير موجود');
    if (role.isSystem) throw AppError.forbidden('لا يمكن حذف دور نظامي', 'SYSTEM_ROLE');
    if (role._count.users > 0) throw AppError.conflict('الدور مستخدم من قِبل مستخدمين', 'ROLE_IN_USE');
    await prisma.role.delete({ where: { id } });
  },
};

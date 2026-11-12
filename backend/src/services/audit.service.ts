import { prisma } from '../config/prisma';

export const auditService = {
  async log(input: { userId?: number; action: string; entity: string; entityId?: number; changes?: unknown; ipAddress?: string; userAgent?: string; requestId?: string; }) {
    await prisma.auditLog.create({
      data: { userId: input.userId, action: input.action, entity: input.entity, entityId: input.entityId, changes: input.changes ? JSON.stringify(input.changes) : undefined, ipAddress: input.ipAddress, userAgent: input.userAgent, requestId: input.requestId },
    }).catch(() => undefined);
  },

  async list(page: number, pageSize: number, filters?: { action?: string; entity?: string; userId?: number }) {
    const where = {
      ...(filters?.action ? { action: filters.action } : {}),
      ...(filters?.entity ? { entity: filters.entity } : {}),
      ...(filters?.userId ? { userId: filters.userId } : {}),
    };
    const [total, items] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: 'desc' } }),
    ]);
    return { items, total, page, pageSize };
  },
};

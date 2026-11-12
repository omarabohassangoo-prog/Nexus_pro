import { prisma } from '../config/prisma';
import { cache } from './external/cache.service';

export const statsService = {
  async dashboard() {
    const cached = cache.get<unknown>('stats:dashboard');
    if (cached) return cached;

    const [totalUsers, activeUsers, pendingUsers, totalRoles, totalPages, totalTemplates, recentUsers, recentAudit, byType] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      prisma.user.count({ where: { status: 'PENDING', deletedAt: null } }),
      prisma.role.count(),
      prisma.page.count(),
      prisma.template.count(),
      prisma.user.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, email: true, name: true, type: true, createdAt: true } }),
      prisma.auditLog.findMany({ take: 10, orderBy: { createdAt: 'desc' }, select: { id: true, action: true, entity: true, createdAt: true, userId: true } }),
      prisma.user.groupBy({ by: ['type'], _count: { _all: true }, where: { deletedAt: null } }),
    ]);

    const result = {
      users: { total: totalUsers, active: activeUsers, pending: pendingUsers, byType: byType.map(b => ({ type: b.type, count: b._count._all })) },
      roles: totalRoles, pages: totalPages, templates: totalTemplates,
      recentUsers, recentActivity: recentAudit,
    };
    cache.set('stats:dashboard', result, 60 * 1000);
    return result;
  },
};

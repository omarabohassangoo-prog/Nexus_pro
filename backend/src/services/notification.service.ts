import { prisma } from '../config/prisma';
import { realtimeService } from '../realtime/realtime.service';
import { logger } from '../utils/logger';

export const notificationService = {
  async create(input: { userId: number; type: string; title: string; body: string; data?: unknown }) {
    const n = await prisma.notification.create({
      data: { userId: input.userId, type: input.type, title: input.title, body: input.body, data: input.data ? JSON.stringify(input.data) : null },
    });
    realtimeService.toUser(input.userId, 'notification:new', { id: n.id, type: n.type, title: n.title, body: n.body, createdAt: n.createdAt.toISOString() });
    return n;
  },

  async list(userId: number, page: number, pageSize: number) {
    const [total, items] = await Promise.all([
      prisma.notification.count({ where: { userId } }),
      prisma.notification.findMany({ where: { userId }, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: 'desc' } }),
    ]);
    return { items, total, page, pageSize };
  },

  async markRead(userId: number, id: number) { await prisma.notification.updateMany({ where: { id, userId, isRead: false }, data: { isRead: true, readAt: new Date() } }); },
  async markAllRead(userId: number) { await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true, readAt: new Date() } }); },
  async unreadCount(userId: number) { return prisma.notification.count({ where: { userId, isRead: false } }); },
  async broadcast(message: string, level: 'info' | 'warning' | 'error' = 'info') { realtimeService.toAll('system:announcement', { message, level }); logger.info({ message, level }, 'broadcast sent'); },
};

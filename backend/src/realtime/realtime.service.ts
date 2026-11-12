import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { presenceService } from './presence.service';

let io: SocketServer | null = null;

interface SocketData {
  userId: number;
  email: string;
  type: string;
  roleId: number | null;
}

export function getIO(): SocketServer | null { return io; }

async function authenticateSocket(socket: Socket): Promise<SocketData | null> {
  const token = (socket.handshake.auth?.token as string | undefined) ?? (socket.handshake.query?.token as string | undefined);
  if (!token) return null;
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: number; email: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, type: true, status: true, roleId: true, deletedAt: true },
    });
    if (!user || user.deletedAt || user.status !== 'ACTIVE') return null;
    return { userId: user.id, email: user.email, type: user.type, roleId: user.roleId };
  } catch { return null; }
}

export function initRealtime(server: HttpServer): SocketServer {
  io = new SocketServer(server, {
    path: '/ws',
    cors: { origin: env.CORS_ORIGINS, credentials: true },
    pingTimeout: 30000,
    pingInterval: 25000,
  });

  io.use(async (socket, next) => {
    const data = await authenticateSocket(socket);
    if (!data) return next(new Error('UNAUTHORIZED'));
    (socket.data as SocketData) = data;
    next();
  });

  io.on('connection', async (socket) => {
    const data = socket.data as SocketData;
    logger.info({ userId: data.userId, socketId: socket.id }, 'ws connected');

    await socket.join(`user:${data.userId}`);
    await socket.join(`role:${data.type}`);
    if (data.type === 'SUPER_ADMIN' || data.type === 'ADMIN') await socket.join('admins');

    presenceService.addConnection(data.userId, socket.id);
    io!.to('admins').emit('presence:update', { userId: data.userId, status: 'online' });

    socket.on('join:chat', async (chatId: number) => {
      const participant = await prisma.chatParticipant.findUnique({
        where: { chatId_userId: { chatId, userId: data.userId } },
      });
      if (!participant) { socket.emit('error', { code: 'CHAT_FORBIDDEN' }); return; }
      await socket.join(`chat:${chatId}`);
      socket.emit('chat:joined', { chatId });
    });

    socket.on('chat:typing', (payload: { chatId: number; isTyping: boolean }) => {
      socket.to(`chat:${payload.chatId}`).emit('chat:typing', { chatId: payload.chatId, userId: data.userId, isTyping: payload.isTyping });
    });

    socket.on('chat:read', async (payload: { chatId: number; messageId: number }) => {
      await prisma.chatMessage.updateMany({
        where: { id: payload.messageId, chatId: payload.chatId },
        data: { readAt: new Date() },
      }).catch(() => undefined);
      socket.to(`chat:${payload.chatId}`).emit('chat:read', payload);
    });

    socket.on('disconnect', () => {
      presenceService.removeConnection(data.userId, socket.id);
      if (!presenceService.isOnline(data.userId)) {
        io!.to('admins').emit('presence:update', { userId: data.userId, status: 'offline', lastSeen: new Date().toISOString() });
      }
      logger.info({ userId: data.userId, socketId: socket.id }, 'ws disconnected');
    });
  });

  setInterval(async () => {
    const sockets = await io!.fetchSockets();
    for (const s of sockets) {
      const d = s.data as SocketData;
      const user = await prisma.user.findUnique({ where: { id: d.userId }, select: { status: true, deletedAt: true } });
      if (!user || user.deletedAt || user.status !== 'ACTIVE') s.disconnect(true);
    }
  }, 5 * 60 * 1000);

  return io;
}

export const realtimeService = {
  toUser(userId: number, event: string, payload: unknown): void { io?.to(`user:${userId}`).emit(event, payload); },
  toUsers(userIds: number[], event: string, payload: unknown): void { for (const id of userIds) io?.to(`user:${id}`).emit(event, payload); },
  toRole(type: string, event: string, payload: unknown): void { io?.to(`role:${type}`).emit(event, payload); },
  toAdmins(event: string, payload: unknown): void { io?.to('admins').emit(event, payload); },
  toRoom(room: string, event: string, payload: unknown): void { io?.to(room).emit(event, payload); },
  toAll(event: string, payload: unknown): void { io?.emit(event, payload); },
  async disconnectUser(userId: number, sessionId?: string): Promise<void> {
    const sockets = await io?.in(`user:${userId}`).fetchSockets();
    sockets?.forEach(s => { s.emit('session:revoked', { sessionId }); s.disconnect(true); });
  },
};

export { presenceService } from './presence.service';

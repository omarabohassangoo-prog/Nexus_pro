import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { requestId } from './middlewares/requestId';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';
import { readLimiter } from './middlewares/rateLimiter';
import { logger } from './utils/logger';
import { prisma } from './config/prisma';
import authRoutes from './routes/auth.routes';
import installRoutes from './routes/install.routes';
import publicRoutes from './routes/public.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import healthRoutes from './routes/health.routes';
import { initRealtime } from './realtime/realtime.service';

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  }));

  app.use(cors({
    origin: (origin, cb) => {
      if (!origin || env.CORS_ORIGINS.includes(origin)) return cb(null, true);
      cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
  }));

  app.use(compression({ threshold: 1024 }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());
  app.use(requestId);

  app.use('/uploads', express.static('uploads', { maxAge: '7d', immutable: true }));

  app.use('/api', readLimiter);
  app.use('/api/health', healthRoutes);
  app.use('/api/install', installRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/public', publicRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export async function startServer() {
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, '🚀 NEXUS backend started');
  });

  const io = initRealtime(server);
  logger.info({ path: '/ws' }, '🔌 WebSocket initialized');

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down gracefully...');
    io.close();
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('✅ Shutdown complete');
      process.exit(0);
    });
    setTimeout(() => { logger.error('Forced shutdown'); process.exit(1); }, 10000);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => logger.error({ reason }, 'unhandledRejection'));
  process.on('uncaughtException', (err) => { logger.error({ err }, 'uncaughtException'); void shutdown('uncaughtException'); });

  return { app, server, io };
}

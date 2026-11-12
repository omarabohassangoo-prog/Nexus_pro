// ═══════════════════════════════════════════════════════
// Vercel-compatible app factory (no WebSocket, no filesystem)
// ═══════════════════════════════════════════════════════
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
import authRoutes from './routes/auth.routes';
import installRoutes from './routes/install.routes';
import publicRoutes from './routes/public.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import healthRoutes from './routes/health.routes';

export function createVercelApp(): Express {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
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

  // لا يوجد express.static في Vercel — الملفات على Blob/S3

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

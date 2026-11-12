import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { getIO, presenceService } from '../realtime/realtime.service';
import type { ApiResponse } from '../types/common.types';

const router = Router();

router.get('/live', (_req: Request, res: Response) => {
  res.json({ success: true, data: { status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() } } as ApiResponse);
});

router.get('/ready', async (_req: Request, res: Response) => {
  const start = Date.now();
  let db = 'up';
  try { await prisma.$queryRaw`SELECT 1`; } catch { db = 'down'; }
  const ok = db === 'up';
  res.status(ok ? 200 : 503).json({ success: ok, data: { db, latencyMs: Date.now() - start, memory: process.memoryUsage() } } as ApiResponse);
});

router.get('/ws', (_req: Request, res: Response) => {
  const io = getIO();
  res.json({ success: true, data: { enabled: !!io, ...presenceService.stats() } } as ApiResponse);
});

export default router;

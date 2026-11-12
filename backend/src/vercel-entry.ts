// ═══════════════════════════════════════════════════════
// Vercel Serverless Entry Point
// ═══════════════════════════════════════════════════════
import { createApp } from './app';

// لا نستدعي initRealtime على Vercel (WebSocket غير مدعوم)
const app = createApp();

export default app;

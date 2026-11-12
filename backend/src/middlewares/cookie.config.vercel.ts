// ═══════════════════════════════════════════════════════
// إعدادات cookies عبر domains مختلفة (Vercel Frontend ≠ Backend)
// ═══════════════════════════════════════════════════════
import type { CookieOptions } from 'express';

export const refreshCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: true,
  sameSite: 'none', // ضروري للـ cross-domain على Vercel
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
});

export const clearRefreshCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  path: '/',
});

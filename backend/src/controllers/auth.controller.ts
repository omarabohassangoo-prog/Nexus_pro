import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { AppError } from '../utils/AppError';
import type { ApiResponse } from '../types/common.types';

export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result, message: 'تم التسجيل، تحقق من بريدك' } as ApiResponse);
  },
  async login(req: Request, res: Response) {
    const result = await authService.login(req.body, { ip: req.ip, ua: req.header('User-Agent') });
    res.cookie('refresh_token', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/api/auth' });
    res.json({ success: true, data: result } as ApiResponse);
  },
  async refresh(req: Request, res: Response) {
    const token = req.body?.refreshToken || req.cookies?.refresh_token;
    if (!token) throw AppError.unauthorized('refresh token مفقود', 'REFRESH_MISSING');
    const result = await authService.refresh(token);
    res.cookie('refresh_token', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/api/auth' });
    res.json({ success: true, data: result } as ApiResponse);
  },
  async logout(req: Request, res: Response) {
    const token = req.body?.refreshToken || req.cookies?.refresh_token;
    if (token) await authService.logout(token);
    res.clearCookie('refresh_token', { path: '/api/auth' });
    res.json({ success: true, message: 'تم الخروج' } as ApiResponse);
  },
  async sessions(req: Request, res: Response) {
    const items = await authService.listSessions(req.user!.id);
    res.json({ success: true, data: items } as ApiResponse);
  },
  async revokeSession(req: Request, res: Response) {
    await authService.revokeSession(req.user!.id, req.params.id as string);
    res.status(204).end();
  },
  async changePassword(req: Request, res: Response) {
    await authService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
    res.json({ success: true, message: 'تم تغيير كلمة المرور' } as ApiResponse);
  },
  async forgotPassword(req: Request, res: Response) {
    await authService.forgotPassword(req.body.email);
    res.json({ success: true, message: 'إن كان البريد مسجلاً، ستصل رسالة' } as ApiResponse);
  },
  async resetPassword(req: Request, res: Response) {
    await authService.resetPassword(req.body.token, req.body.password);
    res.json({ success: true, message: 'تم إعادة التعيين' } as ApiResponse);
  },
  async activate(req: Request, res: Response) {
    await authService.activate(req.body.token);
    res.json({ success: true, message: 'تم التنشيط' } as ApiResponse);
  },
  async me(req: Request, res: Response) {
    const { userService } = await import('../services/user.service');
    const me = await userService.getById(req.user!.id);
    res.json({ success: true, data: me } as ApiResponse);
  },
};

import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { cache, TTL } from '../../services/external/cache.service';
import type { ApiResponse } from '../../types/common.types';

const CACHE_PUBLIC = 'pages:public';

export const adminPagesController = {
  async list(_req: Request, res: Response) {
    const items = await prisma.page.findMany({ orderBy: [{ navOrder: 'asc' }, { createdAt: 'desc' }] });
    res.json({ success: true, data: items } as ApiResponse);
  },
  async get(req: Request, res: Response) {
    const p = await prisma.page.findUnique({ where: { id: Number(req.params.id) } });
    if (!p) throw AppError.notFound('الصفحة غير موجودة');
    res.json({ success: true, data: p } as ApiResponse);
  },
  async create(req: Request, res: Response) {
    const exists = await prisma.page.findUnique({ where: { slug: req.body.slug } });
    if (exists) throw AppError.conflict('الرابط مستخدم', 'SLUG_EXISTS');
    const p = await prisma.page.create({
      data: { slug: req.body.slug, title: req.body.title, content: req.body.content, metaTitle: req.body.metaTitle, metaDescription: req.body.metaDescription, ogImage: req.body.ogImage, showInNav: req.body.showInNav ?? true, showInFooter: req.body.showInFooter ?? true, navOrder: req.body.navOrder ?? 0, requiresAuth: req.body.requiresAuth ?? false, isSystem: false },
    });
    cache.delete(CACHE_PUBLIC);
    res.status(201).json({ success: true, data: p } as ApiResponse);
  },
  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const cur = await prisma.page.findUnique({ where: { id } });
    if (!cur) throw AppError.notFound('الصفحة غير موجودة');
    if (cur.isSystem && req.body.status === 'disabled') throw AppError.forbidden('لا يمكن تعطيل صفحة نظامية', 'SYSTEM_PAGE');
    const p = await prisma.page.update({ where: { id }, data: req.body });
    cache.delete(CACHE_PUBLIC);
    res.json({ success: true, data: p } as ApiResponse);
  },
  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    const p = await prisma.page.findUnique({ where: { id } });
    if (!p) throw AppError.notFound('الصفحة غير موجودة');
    if (p.isSystem) throw AppError.forbidden('لا يمكن حذف صفحة نظامية', 'SYSTEM_PAGE');
    await prisma.page.delete({ where: { id } });
    cache.delete(CACHE_PUBLIC);
    res.status(204).end();
  },
  async getPublicBySlug(req: Request, res: Response) {
    const slug = req.params.slug as string;
    const cached = cache.get<unknown>(`page:${slug}`);
    if (cached) { res.json({ success: true, data: cached } as ApiResponse); return; }
    const p = await prisma.page.findFirst({ where: { slug, status: 'active' } });
    if (!p) throw AppError.notFound('الصفحة غير موجودة');
    cache.set(`page:${slug}`, p, TTL.PAGES);
    res.json({ success: true, data: p } as ApiResponse);
  },
  async publicNav(_req: Request, res: Response) {
    const cached = cache.get<unknown>('pages:nav');
    if (cached) { res.json({ success: true, data: cached } as ApiResponse); return; }
    const items = await prisma.page.findMany({ where: { status: 'active' }, orderBy: [{ navOrder: 'asc' }], select: { slug: true, title: true, showInNav: true, showInFooter: true, navOrder: true, isSystem: true } });
    cache.set('pages:nav', items, TTL.PAGES);
    res.json({ success: true, data: items } as ApiResponse);
  },
};

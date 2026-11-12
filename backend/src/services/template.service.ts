import Mustache from 'mustache';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { cache, TTL } from './external/cache.service';
import { sanitizeContext } from '../utils/sanitize';
import type { CreateTemplateInput, UpdateTemplateInput } from '../schemas/templates.schema';

Mustache.escape = (text: string) => text;

const CACHE_KEY_BY_KEY = (key: string, lang: string) => `template:key:${key}:${lang}`;

export const templateService = {
  async list() {
    return prisma.template.findMany({
      orderBy: [{ type: 'asc' }, { key: 'asc' }],
      select: { id: true, key: true, name: true, type: true, subject: true, language: true, isSystem: true, isActive: true, updatedAt: true },
    });
  },

  async getById(id: number) {
    const t = await prisma.template.findUnique({ where: { id }, include: { versions: { orderBy: { version: 'desc' }, take: 10 }, _count: { select: { usages: true } } } });
    if (!t) throw AppError.notFound('القالب غير موجود');
    return t;
  },

  async create(input: CreateTemplateInput, actorId: number) {
    const exists = await prisma.template.findUnique({ where: { key: input.key } });
    if (exists) throw AppError.conflict('مفتاح القالب مستخدم', 'TEMPLATE_KEY_EXISTS');
    const t = await prisma.template.create({
      data: { key: input.key, name: input.name, type: input.type, subject: input.subject, body: input.body, variables: input.variables ? JSON.stringify(input.variables) : null, language: input.language, isSystem: false },
    });
    await prisma.templateVersion.create({ data: { templateId: t.id, version: 1, body: t.body, subject: t.subject, createdBy: actorId } });
    cache.deletePrefix('template:');
    return t;
  },

  async update(id: number, input: UpdateTemplateInput, actorId: number) {
    const current = await prisma.template.findUnique({ where: { id } });
    if (!current) throw AppError.notFound('القالب غير موجود');
    const updated = await prisma.template.update({
      where: { id },
      data: { name: input.name, subject: input.subject, body: input.body, variables: input.variables ? JSON.stringify(input.variables) : undefined, language: input.language },
    });
    if (input.body && input.body !== current.body) {
      const last = await prisma.templateVersion.findFirst({ where: { templateId: id }, orderBy: { version: 'desc' } });
      await prisma.templateVersion.create({ data: { templateId: id, version: (last?.version ?? 0) + 1, body: updated.body, subject: updated.subject, createdBy: actorId } });
    }
    cache.deletePrefix('template:');
    return updated;
  },

  async remove(id: number) {
    const t = await prisma.template.findUnique({ where: { id } });
    if (!t) throw AppError.notFound('القالب غير موجود');
    if (t.isSystem) throw AppError.forbidden('لا يمكن حذف قالب نظامي', 'SYSTEM_TEMPLATE');
    await prisma.template.delete({ where: { id } });
    cache.deletePrefix('template:');
  },

  async restoreVersion(templateId: number, versionId: number, actorId: number) {
    const v = await prisma.templateVersion.findUnique({ where: { id: versionId } });
    if (!v || v.templateId !== templateId) throw AppError.notFound('نسخة غير موجودة');
    return templateService.update(templateId, { body: v.body, subject: v.subject ?? undefined }, actorId);
  },

  async find(key: string, language = 'ar') {
    const cacheKey = CACHE_KEY_BY_KEY(key, language);
    const cached = cache.get<{ subject: string | null; body: string; id: number; type: string }>(cacheKey);
    if (cached) return cached;

    let t = await prisma.template.findFirst({ where: { key, language, isActive: true } });
    if (!t && language !== 'ar') t = await prisma.template.findFirst({ where: { key, language: 'ar', isActive: true } });
    if (!t) throw AppError.notFound(`القالب ${key} غير موجود`);
    const result = { id: t.id, subject: t.subject, body: t.body, type: t.type };
    cache.set(cacheKey, result, TTL.TEMPLATES);
    return result;
  },

  async preview(key: string, context: Record<string, unknown>, language = 'ar') {
    const t = await templateService.find(key, language);
    const safeCtx = sanitizeContext(context);
    return { subject: t.subject ? Mustache.render(t.subject, safeCtx) : '', body: Mustache.render(t.body, safeCtx) };
  },

  async render(key: string, context: Record<string, unknown>, opts: { userId?: number; channel: string; language?: string }): Promise<{ subject: string; body: string; templateId: number }> {
    const t = await templateService.find(key, opts.language);
    const safeCtx = sanitizeContext(context);
    const body = Mustache.render(t.body, safeCtx);
    const subject = t.subject ? Mustache.render(t.subject, safeCtx) : '';
    await prisma.templateUsage.create({ data: { templateId: t.id, userId: opts.userId, channel: opts.channel, status: 'rendered' } }).catch(() => undefined);
    return { subject, body, templateId: t.id };
  },
};

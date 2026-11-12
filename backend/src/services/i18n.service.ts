import { prisma } from '../config/prisma';
import { cache, TTL } from './external/cache.service';

export const i18nService = {
  async listLanguages() { return prisma.language.findMany({ orderBy: [{ isDefault: 'desc' }, { code: 'asc' }] }); },

  async getTranslations(code: string, namespace = 'common'): Promise<Record<string, string>> {
    const cacheKey = `i18n:${code}:${namespace}`;
    const hit = cache.get<Record<string, string>>(cacheKey);
    if (hit) return hit;
    const lang = await prisma.language.findUnique({ where: { code } });
    if (!lang) return {};
    const rows = await prisma.translation.findMany({ where: { languageId: lang.id, namespace }, select: { key: true, value: true } });
    const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
    cache.set(cacheKey, map, TTL.SETTINGS);
    return map;
  },

  async upsertTranslation(input: { code: string; namespace: string; key: string; value: string }) {
    const lang = await prisma.language.findUnique({ where: { code: input.code } });
    if (!lang) throw new Error('language not found');
    await prisma.translation.upsert({
      where: { languageId_namespace_key: { languageId: lang.id, namespace: input.namespace, key: input.key } },
      update: { value: input.value },
      create: { languageId: lang.id, namespace: input.namespace, key: input.key, value: input.value },
    });
    cache.deletePrefix('i18n:');
  },

  async bulkUpsert(code: string, namespace: string, entries: Array<{ key: string; value: string }>) {
    const lang = await prisma.language.findUnique({ where: { code } });
    if (!lang) throw new Error('language not found');
    await prisma.$transaction(entries.map(e => prisma.translation.upsert({
      where: { languageId_namespace_key: { languageId: lang.id, namespace, key: e.key } },
      update: { value: e.value },
      create: { languageId: lang.id, namespace, key: e.key, value: e.value },
    })));
    cache.deletePrefix('i18n:');
  },

  async exportJson(code: string) {
    const lang = await prisma.language.findUnique({ where: { code } });
    if (!lang) return {};
    const rows = await prisma.translation.findMany({ where: { languageId: lang.id } });
    const out: Record<string, Record<string, string>> = {};
    for (const r of rows) { out[r.namespace] ??= {}; out[r.namespace]![r.key] = r.value; }
    return out;
  },
};

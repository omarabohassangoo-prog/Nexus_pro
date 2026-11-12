import { PaginationMeta } from '../types/common.types';

export const MAX_PAGE_SIZE = 200;

export function parsePagination(query: Record<string, unknown>): { skip: number; take: number; page: number; pageSize: number } {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(query.pageSize) || 20));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function buildPaginationMeta(total: number, page: number, pageSize: number): PaginationMeta {
  const totalPages = Math.ceil(total / pageSize) || 1;
  return {
    page, pageSize, total, totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

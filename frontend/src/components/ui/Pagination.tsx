import type { PaginationMeta } from '../../types/api.types';

interface Props { meta: PaginationMeta; onPageChange: (page: number) => void; onPageSizeChange?: (size: number) => void; }

export function Pagination({ meta, onPageChange, onPageSizeChange }: Props) {
  return (
    <div className="flex items-center justify-between mt-4" style={{ flexWrap: 'wrap', gap: 12 }}>
      <div className="text-sm text-muted">إجمالي {meta.total} — صفحة {meta.page}/{meta.totalPages}</div>
      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <select value={meta.pageSize} onChange={e => onPageSizeChange(Number(e.target.value))} style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} / صفحة</option>)}
          </select>
        )}
        <button disabled={!meta.hasPrev} onClick={() => onPageChange(meta.page - 1)} style={{ padding: '6px 12px', border: '1px solid var(--border)', background: '#fff', borderRadius: 'var(--radius)' }}>السابق</button>
        <button disabled={!meta.hasNext} onClick={() => onPageChange(meta.page + 1)} style={{ padding: '6px 12px', border: '1px solid var(--border)', background: '#fff', borderRadius: 'var(--radius)' }}>التالي</button>
      </div>
    </div>
  );
}

import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  width?: string;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  emptyMessage?: string;
  onSort?: (key: string) => void;
}

export function Table<T>({ columns, rows, rowKey, loading, emptyMessage = 'لا توجد بيانات', onSort }: Props<T>) {
  return (
    <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {columns.map(c => (
              <th key={c.key} style={{ padding: '12px 16px', textAlign: 'start', fontWeight: 600, width: c.width, borderBottom: '1px solid var(--border)', cursor: onSort ? 'pointer' : 'default' }} onClick={() => onSort?.(c.key)}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan={columns.length} style={{ padding: 40, textAlign: 'center' }} className="text-muted">جاري التحميل...</td></tr>}
          {!loading && rows.length === 0 && <tr><td colSpan={columns.length} style={{ padding: 40, textAlign: 'center' }} className="text-muted">{emptyMessage}</td></tr>}
          {!loading && rows.map(r => (
            <tr key={rowKey(r)} style={{ borderBottom: '1px solid var(--border)' }}>
              {columns.map(c => <td key={c.key} style={{ padding: '12px 16px' }}>{c.render(r)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

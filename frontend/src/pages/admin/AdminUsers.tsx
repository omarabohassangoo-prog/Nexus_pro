import { useState } from 'react';
import { useUsers } from '../../hooks/useUsers';
import { Table, type Column } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useDebounce } from '../../hooks/useDebounce';
import type { SafeUser } from '../../types/models.types';

export function AdminUsers() {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const { filters, setFilters, items, meta, loading, error, reload } = useUsers({ page: 1, pageSize: 20, search: debounced });

  const columns: Column<SafeUser>[] = [
    { key: 'id', header: '#', render: u => u.id, width: '60px' },
    { key: 'name', header: 'الاسم', render: u => u.name },
    { key: 'email', header: 'البريد', render: u => u.email },
    { key: 'type', header: 'النوع', render: u => <Badge color={u.type === 'SUPER_ADMIN' ? 'danger' : u.type === 'ADMIN' ? 'info' : 'default'}>{u.type}</Badge> },
    { key: 'status', header: 'الحالة', render: u => <Badge color={u.status === 'ACTIVE' ? 'success' : u.status === 'PENDING' ? 'warning' : 'danger'}>{u.status}</Badge> },
    { key: 'createdAt', header: 'تاريخ الإنشاء', render: u => new Date(u.createdAt).toLocaleDateString('ar') },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">المستخدمون</h1>
        <Button onClick={() => alert('مودال الإنشاء — قيد التطوير')}>+ مستخدم جديد</Button>
      </div>
      <div className="mb-4"><Input placeholder="ابحث بالاسم أو البريد..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      {error && <div className="text-danger mb-4">{error}</div>}
      <Table columns={columns} rows={items} rowKey={u => u.id} loading={loading} />
      {meta && <Pagination meta={meta} onPageChange={p => setFilters({ ...filters, page: p })} onPageSizeChange={s => setFilters({ ...filters, pageSize: s, page: 1 })} />}
      <div className="mt-4"><Button variant="outline" onClick={reload}>تحديث</Button></div>
    </div>
  );
}

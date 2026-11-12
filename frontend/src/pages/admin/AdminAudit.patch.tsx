// استبدل AdminAudit.tsx بهذا لتحميل السجل من API
import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import type { ApiResponse, PaginatedData } from '../../types/api.types';
import { Table, type Column } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Badge } from '../../components/ui/Badge';

interface AuditRow { id: number; action: string; entity: string; entityId: number | null; userId: number | null; createdAt: string; }

export function AdminAudit() {
  const [items, setItems] = useState<AuditRow[]>([]);
  const [meta, setMeta] = useState<{ page: number; pageSize: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get<ApiResponse<PaginatedData<AuditRow>>>('/admin/audit', { params: { page, pageSize: 20 } })
      .then(r => { setItems(r.data.data!.items); setMeta(r.data.data!.meta); })
      .catch(() => undefined);
  }, [page]);

  const columns: Column<AuditRow>[] = [
    { key: 'id', header: '#', render: r => r.id, width: '70px' },
    { key: 'action', header: 'الإجراء', render: r => <Badge>{r.action}</Badge> },
    { key: 'entity', header: 'الكيان', render: r => r.entity },
    { key: 'entityId', header: 'المعرف', render: r => r.entityId ?? '—' },
    { key: 'userId', header: 'المستخدم', render: r => r.userId ?? '—' },
    { key: 'createdAt', header: 'التاريخ', render: r => new Date(r.createdAt).toLocaleString('ar') },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">سجل النشاطات</h1>
      <Table columns={columns} rows={items} rowKey={r => r.id} />
      {meta && <Pagination meta={meta} onPageChange={setPage} />}
    </div>
  );
}

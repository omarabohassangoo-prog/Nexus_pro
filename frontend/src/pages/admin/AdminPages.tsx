import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin.api';
import { Table, type Column } from '../../components/ui/Table';
import type { Page } from '../../types/models.types';

export function AdminPages() {
  const [items, setItems] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminApi.pages().then(setItems).finally(() => setLoading(false)); }, []);

  const columns: Column<Page>[] = [
    { key: 'slug', header: 'الرابط', render: p => p.slug },
    { key: 'title', header: 'العنوان', render: p => p.title },
    { key: 'showInNav', header: 'في القائمة', render: p => p.showInNav ? '✅' : '—' },
    { key: 'isSystem', header: 'نظامي', render: p => p.isSystem ? '✅' : '—' },
    { key: 'status', header: 'الحالة', render: p => p.status },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">الصفحات</h1>
      <Table columns={columns} rows={items} rowKey={p => p.id} loading={loading} />
    </div>
  );
}

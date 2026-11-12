import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin.api';
import { Table, type Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import type { Template } from '../../types/models.types';

export function AdminTemplates() {
  const [items, setItems] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminApi.templates().then(setItems).finally(() => setLoading(false)); }, []);

  const columns: Column<Template>[] = [
    { key: 'key', header: 'المفتاح', render: t => t.key },
    { key: 'name', header: 'الاسم', render: t => t.name },
    { key: 'type', header: 'النوع', render: t => <Badge>{t.type}</Badge> },
    { key: 'language', header: 'اللغة', render: t => t.language },
    { key: 'isSystem', header: 'نظامي', render: t => t.isSystem ? '✅' : '—' },
    { key: 'updatedAt', header: 'آخر تحديث', render: t => new Date(t.updatedAt).toLocaleDateString('ar') },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">القوالب</h1>
      <Table columns={columns} rows={items} rowKey={t => t.id} loading={loading} />
    </div>
  );
}

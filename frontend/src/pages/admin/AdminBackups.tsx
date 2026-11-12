import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin.api';
import { extractError } from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Table, type Column } from '../../components/ui/Table';

interface Backup { id: number; filename: string; size: number; createdAt: string; }

export function AdminBackups() {
  const toast = useToast();
  const [items, setItems] = useState<Backup[]>([]);
  const [busy, setBusy] = useState(false);

  const load = () => adminApi.backups().then(setItems).catch(e => toast.error(extractError(e).message));
  useEffect(() => { void load(); }, []);

  const create = async () => {
    setBusy(true);
    try { await adminApi.createBackup(); toast.success('تم إنشاء النسخة'); await load(); }
    catch (e) { toast.error(extractError(e).message); }
    finally { setBusy(false); }
  };

  const restore = async (id: number) => {
    if (!confirm('سيتم استبدال البيانات الحالية. متابعة؟')) return;
    try { await adminApi.restoreBackup(id); toast.success('تم الاستعادة'); }
    catch (e) { toast.error(extractError(e).message); }
  };

  const columns: Column<Backup>[] = [
    { key: 'filename', header: 'الملف', render: b => b.filename },
    { key: 'size', header: 'الحجم', render: b => `${(b.size / 1024).toFixed(1)} KB` },
    { key: 'createdAt', header: 'التاريخ', render: b => new Date(b.createdAt).toLocaleString('ar') },
    { key: 'actions', header: 'إجراءات', render: b => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => restore(b.id)}>استعادة</Button>
        <Button size="sm" variant="danger" onClick={async () => { await adminApi.deleteBackup(b.id); await load(); }}>حذف</Button>
      </div>
    ) },
  ];

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">النسخ الاحتياطي</h1>
        <Button onClick={create} loading={busy}>+ نسخة جديدة</Button>
      </div>
      <Table columns={columns} rows={items} rowKey={b => b.id} emptyMessage="لا توجد نسخ" />
    </div>
  );
}

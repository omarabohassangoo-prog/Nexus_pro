import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin.api';
import { extractError } from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import type { Setting } from '../../types/models.types';

const GROUPS = ['general', 'email', 'sms', 'whatsapp', 'paypal', 'files', 'css', 'i18n', 'database', 'env', 'secrets', 'cloud'];

export function AdminSettings() {
  const toast = useToast();
  const [group, setGroup] = useState('general');
  const [items, setItems] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    adminApi.getSettingsGroup(group).then(setItems).catch(e => toast.error(extractError(e).message)).finally(() => setLoading(false));
  }, [group, toast]);

  const onChange = (key: string, value: string) => setItems(prev => prev.map(i => i.key === key ? { ...i, value } : i));

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.updateSettingsGroup(group, items.map(i => ({ key: i.key, value: i.value })));
      toast.success('تم الحفظ');
    } catch (e) { toast.error(extractError(e).message); }
    finally { setSaving(false); }
  };

  const test = async () => {
    try {
      const r = await adminApi.testService(group);
      r.ok ? toast.success(r.message) : toast.error(r.message);
    } catch (e) { toast.error(extractError(e).message); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">الإعدادات</h1>
      <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
        {GROUPS.map(g => (
          <button key={g} onClick={() => setGroup(g)} style={{ padding: '6px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: group === g ? 'var(--primary)' : '#fff', color: group === g ? '#fff' : 'var(--fg)' }}>{g}</button>
        ))}
      </div>
      {loading ? <p>جاري التحميل...</p> : (
        <div className="bg-white p-4 rounded shadow">
          {items.map(i => (
            <div key={i.key} style={{ marginBottom: 12 }}>
              <Input label={i.key} value={i.value} onChange={e => onChange(i.key, e.target.value)} disabled={i.isSecret && i.value === '***'} />
            </div>
          ))}
          <div className="flex gap-2 mt-4">
            <Button onClick={save} loading={saving}>حفظ</Button>
            <Button variant="outline" onClick={test}>اختبار الاتصال</Button>
          </div>
        </div>
      )}
    </div>
  );
}

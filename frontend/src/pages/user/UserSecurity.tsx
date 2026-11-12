import { useEffect, useState } from 'react';
import { authApi } from '../../api/auth.api';
import { extractError } from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function UserSecurity() {
  const toast = useToast();
  const [sessions, setSessions] = useState<Array<{ id: string; ipAddress: string | null; createdAt: string }>>([]);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => authApi.sessions().then(setSessions).catch(() => undefined);
  useEffect(() => { void load(); }, []);

  const changePassword = async () => {
    setBusy(true);
    try { await authApi.changePassword(current, next); toast.success('تم التغيير'); setCurrent(''); setNext(''); await load(); }
    catch (e) { toast.error(extractError(e).message); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">الأمان</h1>
      <div className="bg-white p-4 rounded shadow mb-4">
        <h3 className="font-bold mb-3">تغيير كلمة المرور</h3>
        <div className="flex flex-col gap-3" style={{ maxWidth: 360 }}>
          <Input label="الحالية" type="password" value={current} onChange={e => setCurrent(e.target.value)} />
          <Input label="الجديدة" type="password" value={next} onChange={e => setNext(e.target.value)} />
          <Button onClick={changePassword} loading={busy}>تغيير</Button>
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-bold mb-3">الجلسات النشطة</h3>
        {sessions.length === 0 ? <p className="text-muted text-sm">لا توجد جلسات</p> : sessions.map(s => (
          <div key={s.id} className="flex justify-between text-sm" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <span>{s.ipAddress ?? '—'}</span>
            <span className="text-muted">{new Date(s.createdAt).toLocaleString('ar')}</span>
            <Button size="sm" variant="danger" onClick={async () => { await authApi.revokeSession(s.id); await load(); }}>إلغاء</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

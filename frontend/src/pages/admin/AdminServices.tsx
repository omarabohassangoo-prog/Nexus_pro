import { useState } from 'react';
import { adminApi } from '../../api/admin.api';
import { extractError } from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';

const SERVICES = ['email', 'sms', 'whatsapp', 'paypal'];

export function AdminServices() {
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  const test = async (svc: string) => {
    setBusy(svc);
    try {
      const r = await adminApi.testService(svc);
      r.ok ? toast.success(`${svc}: ${r.message}`) : toast.error(`${svc}: ${r.message}`);
    } catch (e) { toast.error(extractError(e).message); }
    finally { setBusy(null); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">الخدمات الخارجية</h1>
      <div className="grid grid-cols-2 gap-4">
        {SERVICES.map(s => (
          <div key={s} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold mb-2">{s.toUpperCase()}</h3>
            <Button onClick={() => test(s)} loading={busy === s}>اختبار الاتصال</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

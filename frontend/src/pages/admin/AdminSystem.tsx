import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import type { ApiResponse } from '../../types/api.types';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';

interface Health { db: { ok: boolean; latencyMs: number }; memory: { heapUsed: number; heapTotal: number }; uptime: number; ws: { enabled: boolean; onlineUsers: number; totalConnections: number }; }

export function AdminSystem() {
  const toast = useToast();
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    api.get<ApiResponse<Health>>('/admin/system/health').then(r => setHealth(r.data.data!)).catch(() => undefined);
  }, []);

  const reset = async () => {
    if (!confirm('اكتب RESET للتأكيد')) return;
    try {
      await api.post('/admin/system/factory-reset', { confirm: 'RESET' });
      toast.warning('سيتم إعادة التعيين عبر CLI');
    } catch (e) { toast.error((e as Error).message); }
  };

  if (!health) return <div className="flex justify-center p-6"><Spinner size={40} /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">النظام</h1>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">قاعدة البيانات</h3>
          <p>{health.db.ok ? '✅ متصلة' : '❌ معطلة'} — {health.db.latencyMs}ms</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">WebSocket</h3>
          <p>{health.ws.enabled ? '✅ مفعّل' : '❌ معطّل'} — {health.ws.onlineUsers} متصل</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">الذاكرة</h3>
          <p>{(health.memory.heapUsed / 1024 / 1024).toFixed(1)} / {(health.memory.heapTotal / 1024 / 1024).toFixed(1)} MB</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">التشغيل</h3>
          <p>{Math.floor(health.uptime / 60)} دقيقة</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-bold mb-2 text-danger">منطقة الخطر</h3>
        <Button variant="danger" onClick={reset}>Factory Reset</Button>
      </div>
    </div>
  );
}

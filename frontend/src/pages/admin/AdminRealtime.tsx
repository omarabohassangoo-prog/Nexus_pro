import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import type { ApiResponse } from '../../types/api.types';
import { useSocket } from '../../hooks/useSocket';

interface Stats { totalUsers: number; onlineUsers: number; totalConnections: number; }

export function AdminRealtime() {
  const { connected } = useSocket();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const load = () => api.get<ApiResponse<Stats>>('/admin/system/realtime').then(r => setStats(r.data.data!)).catch(() => undefined);
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">الوقت الحقيقي</h1>
      <div className="bg-white p-4 rounded shadow">
        <p className="mb-2">حالة الاتصال: {connected ? '🟢 متصل' : '🔴 منقطع'}</p>
        {stats && (
          <>
            <p>إجمالي المستخدمين: {stats.totalUsers}</p>
            <p>متصلون الآن: {stats.onlineUsers}</p>
            <p>إجمالي الاتصالات: {stats.totalConnections}</p>
          </>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import type { ApiResponse, PaginatedData } from '../../types/api.types';
import type { Notification } from '../../types/models.types';
import { Button } from '../../components/ui/Button';

export function UserNotifications() {
  const [items, setItems] = useState<Notification[]>([]);

  const load = () => api.get<ApiResponse<PaginatedData<Notification>>>('/user/notifications').then(r => setItems(r.data.data?.items ?? [])).catch(() => undefined);
  useEffect(() => { void load(); }, []);

  const markAll = async () => { await api.put('/user/notifications/read-all'); await load(); };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">الإشعارات</h1>
        <Button variant="outline" onClick={markAll}>تعليم الكل كمقروء</Button>
      </div>
      <div className="bg-white rounded shadow">
        {items.length === 0 ? <p className="p-4 text-muted">لا توجد إشعارات</p> : items.map(n => (
          <div key={n.id} style={{ padding: 12, borderBottom: '1px solid var(--border)', background: n.isRead ? '#fff' : '#f0f9ff' }}>
            <p className="font-medium">{n.title}</p>
            <p className="text-sm text-muted">{n.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

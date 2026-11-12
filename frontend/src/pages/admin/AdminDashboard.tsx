import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin.api';
import { extractError } from '../../api/client';
import type { DashboardStats } from '../../types/models.types';
import { Spinner } from '../../components/ui/Spinner';

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { adminApi.dashboard().then(setStats).catch(e => setError(extractError(e).message)); }, []);

  if (error) return <div className="text-danger">{error}</div>;
  if (!stats) return <div className="flex justify-center p-6"><Spinner size={40} /></div>;

  const cards = [
    { label: 'إجمالي المستخدمين', value: stats.users.total, color: 'var(--primary)' },
    { label: 'نشط', value: stats.users.active, color: 'var(--success)' },
    { label: 'قيد الانتظار', value: stats.users.pending, color: 'var(--warning)' },
    { label: 'الأدوار', value: stats.roles, color: 'var(--secondary)' },
    { label: 'الصفحات', value: stats.pages, color: 'var(--primary)' },
    { label: 'القوالب', value: stats.templates, color: 'var(--secondary)' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">لوحة التحكم</h1>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {cards.map(c => (
          <div key={c.label} className="bg-white p-4 rounded shadow">
            <p className="text-sm text-muted">{c.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-3">أحدث المستخدمين</h3>
          {stats.recentUsers.map(u => (
            <div key={u.id} className="flex justify-between text-sm" style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span>{u.name}</span><span className="text-muted">{u.type}</span>
            </div>
          ))}
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-3">آخر النشاطات</h3>
          {stats.recentActivity.map(a => (
            <div key={a.id} className="text-sm" style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              {a.action} — {a.entity}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

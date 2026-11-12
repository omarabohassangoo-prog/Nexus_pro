import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { useRealtimeNotifications } from '../../hooks/useRealtimeNotifications';

const items = [
  { to: '/admin', label: 'لوحة التحكم', exact: true },
  { to: '/admin/users', label: 'المستخدمون' },
  { to: '/admin/roles', label: 'الأدوار' },
  { to: '/admin/pages', label: 'الصفحات' },
  { to: '/admin/templates', label: 'القوالب' },
  { to: '/admin/settings', label: 'الإعدادات' },
  { to: '/admin/services', label: 'الخدمات' },
  { to: '/admin/backups', label: 'النسخ الاحتياطي' },
  { to: '/admin/audit', label: 'السجل' },
  { to: '/admin/realtime', label: 'الوقت الحقيقي' },
  { to: '/admin/system', label: 'النظام' },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  useRealtimeNotifications();

  const doLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <aside style={{ width: 240, background: '#0f172a', color: '#e2e8f0', padding: '16px 0', position: 'fixed', insetInlineStart: 0, top: 0, bottom: 0, zIndex: 50, transform: open ? 'translateX(0)' : undefined }}>
        <div style={{ padding: '0 16px 16px', borderBottom: '1px solid #1e293b', fontWeight: 700, fontSize: 18 }}>NEXUS Admin</div>
        <nav style={{ padding: '12px 0' }}>
          {items.map(it => (
            <NavLink key={it.to} to={it.to} end={it.exact} onClick={() => setOpen(false)} style={({ isActive }) => ({ display: 'block', padding: '10px 20px', color: isActive ? '#fff' : '#cbd5e1', background: isActive ? '#1e293b' : 'transparent', textDecoration: 'none', fontSize: 14 })}>{it.label}</NavLink>
          ))}
        </nav>
      </aside>

      <div style={{ flex: 1, marginInlineStart: 240, minWidth: 0 }}>
        <header style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setOpen(o => !o)} style={{ background: 'transparent', border: 0, fontSize: 20 }}>☰</button>
          <div className="text-sm text-muted">{user?.name} — {user?.type}</div>
          <div className="flex items-center gap-3">
            <Link to="/" style={{ fontSize: 14 }}>الموقع</Link>
            <button onClick={doLogout} style={{ background: 'transparent', border: 0, color: 'var(--danger)', fontSize: 14 }}>خروج</button>
          </div>
        </header>
        <main style={{ padding: 24 }}><Outlet /></main>
      </div>
    </div>
  );
}

import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { useRealtimeNotifications } from '../../hooks/useRealtimeNotifications';

const items = [
  { to: '/user', label: 'لوحتي', exact: true },
  { to: '/user/profile', label: 'الملف الشخصي' },
  { to: '/user/security', label: 'الأمان' },
  { to: '/user/notifications', label: 'الإشعارات' },
];

export function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  useRealtimeNotifications();
  const doLogout = async () => { await logout(); navigate('/login'); };
  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div className="container flex items-center justify-between" style={{ padding: '12px 16px' }}>
          <Link to="/user" style={{ fontWeight: 700 }}>NEXUS — {user?.name}</Link>
          <nav className="flex gap-4">
            {items.map(it => (
              <NavLink key={it.to} to={it.to} end={it.exact} style={({ isActive }) => ({ fontSize: 14, color: isActive ? 'var(--primary)' : 'var(--fg)' })}>{it.label}</NavLink>
            ))}
            <Link to="/" style={{ fontSize: 14 }}>الموقع</Link>
            <button onClick={doLogout} style={{ background: 'transparent', border: 0, color: 'var(--danger)', fontSize: 14 }}>خروج</button>
          </nav>
        </div>
      </header>
      <main className="container" style={{ padding: 24 }}><Outlet /></main>
    </div>
  );
}

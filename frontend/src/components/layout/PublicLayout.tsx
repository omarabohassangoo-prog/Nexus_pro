import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { publicApi } from '../../api/public.api';
import { useAuth } from '../../auth/useAuth';
import { useLanguage } from '../../auth/LanguageContext';

interface NavItem { slug: string; title: string; showInNav: boolean; showInFooter: boolean; navOrder: number; }

export function PublicLayout() {
  const [nav, setNav] = useState<NavItem[]>([]);
  const [site, setSite] = useState<Record<string, string>>({});
  const { user, logout } = useAuth();
  const { lang, setLang } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    publicApi.nav().then(setNav).catch(() => {});
    publicApi.settings().then(setSite).catch(() => {});
  }, []);

  const navItems = nav.filter(n => n.showInNav).sort((a, b) => a.navOrder - b.navOrder);
  const footerItems = nav.filter(n => n.showInFooter).sort((a, b) => a.navOrder - b.navOrder);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container flex items-center justify-between" style={{ padding: '12px 16px' }}>
          <Link to="/" style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg)', textDecoration: 'none' }}>{site['site.name'] ?? 'NEXUS'}</Link>
          <nav className="flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
            {navItems.map(n => (
              <Link key={n.slug} to={n.slug === 'home' ? '/' : `/${n.slug}`} style={{ color: location.pathname === `/${n.slug}` ? 'var(--primary)' : 'var(--fg)', fontWeight: 500, fontSize: 14 }}>{n.title}</Link>
            ))}
            <select value={lang} onChange={e => setLang(e.target.value)} style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: '#fff' }}>
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
            {user ? (
              <>
                <Link to={user.type === 'USER' ? '/user' : '/admin'} style={{ fontSize: 14, padding: '6px 12px', background: 'var(--primary)', color: '#fff', borderRadius: 'var(--radius)', textDecoration: 'none' }}>لوحتي</Link>
                <button onClick={() => void logout()} style={{ background: 'transparent', border: 0, color: 'var(--muted)', fontSize: 14 }}>خروج</button>
              </>
            ) : (
              <>
                <Link to="/login" style={{ fontSize: 14 }}>دخول</Link>
                <Link to="/register" style={{ fontSize: 14, padding: '6px 12px', background: 'var(--primary)', color: '#fff', borderRadius: 'var(--radius)', textDecoration: 'none' }}>تسجيل</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main style={{ flex: 1, padding: '32px 0' }}>
        <div className="container"><Outlet /></div>
      </main>

      <footer style={{ background: '#0f172a', color: '#e2e8f0', padding: '24px 0', marginTop: 40 }}>
        <div className="container flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>{site['site.name'] ?? 'NEXUS'}</p>
            <p className="text-sm" style={{ opacity: .7 }}>© {new Date().getFullYear()} — جميع الحقوق محفوظة</p>
          </div>
          <nav className="flex gap-3" style={{ flexWrap: 'wrap' }}>
            {footerItems.map(n => (
              <Link key={n.slug} to={`/${n.slug}`} style={{ color: '#cbd5e1', fontSize: 14 }}>{n.title}</Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}

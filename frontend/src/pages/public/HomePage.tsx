import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../../api/public.api';

export function HomePage() {
  const [site, setSite] = useState<Record<string, string>>({});
  useEffect(() => { publicApi.settings().then(setSite).catch(() => {}); }, []);
  return (
    <div>
      <section style={{ padding: '60px 0', textAlign: 'center' }}>
        <h1 className="text-3xl font-bold mb-4">{site['site.name'] ?? 'NEXUS'}</h1>
        <p className="text-lg text-muted mb-6" style={{ maxWidth: 600, margin: '0 auto 24px' }}>{site['site.description'] ?? 'منصة مؤسسية متكاملة لإدارة المحتوى والمستخدمين'}</p>
        <div className="flex gap-3 justify-center">
          <Link to="/register" style={{ padding: '12px 24px', background: 'var(--primary)', color: '#fff', borderRadius: 'var(--radius)', textDecoration: 'none' }}>ابدأ الآن</Link>
          <Link to="/about" style={{ padding: '12px 24px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'var(--fg)' }}>اعرف المزيد</Link>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-4" style={{ padding: '40px 0' }}>
        {[
          { t: 'سريع', d: 'أداء عالٍ واستجابة فورية' },
          { t: 'آمن', d: 'تشفير وحماية متقدمة' },
          { t: 'قابل للتخصيص', d: 'إعدادات مرنة لكل احتياج' },
        ].map(f => (
          <div key={f.t} className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-bold mb-2">{f.t}</h3>
            <p className="text-muted">{f.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

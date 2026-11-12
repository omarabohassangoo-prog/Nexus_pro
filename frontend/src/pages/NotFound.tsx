import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <h1 style={{ fontSize: 96, fontWeight: 700, color: 'var(--primary)', lineHeight: 1 }}>404</h1>
      <p className="text-xl text-muted mt-4 mb-6">الصفحة التي تبحث عنها غير موجودة</p>
      <Link to="/" style={{ padding: '10px 20px', background: 'var(--primary)', color: '#fff', borderRadius: 'var(--radius)', textDecoration: 'none' }}>العودة للرئيسية</Link>
    </div>
  );
}

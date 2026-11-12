import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { extractError } from '../../api/client';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      const { redirectTo } = await login(email, password);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? redirectTo, { replace: true });
    } catch (err) {
      const ex = extractError(err);
      const code = (ex as { code?: string }).code;
      const map: Record<string, string> = {
        INVALID_CREDENTIALS: 'بيانات الدخول غير صحيحة',
        EMAIL_NOT_VERIFIED: 'الحساب غير مُفعّل — تحقق من بريدك',
        ACCOUNT_SUSPENDED: 'الحساب معلّق — تواصل مع الإدارة',
        ACCOUNT_LOCKED: 'الحساب مقفل مؤقتاً بسبب محاولات فاشلة',
      };
      setError(code ? (map[code] ?? ex.message) : ex.message);
    } finally { setBusy(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>NEXUS</h1>
          <p className="text-muted mt-2">تسجيل الدخول</p>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4 bg-white p-6 rounded shadow">
          {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 8, fontSize: 14 }}>{error}</div>}
          <Input label="البريد الإلكتروني" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus autoComplete="email" />
          <Input label="كلمة المرور" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />تذكرني</label>
            <Link to="/forgot-password">نسيت كلمة المرور؟</Link>
          </div>
          <Button type="submit" loading={busy}>دخول</Button>
          <p className="text-center text-sm text-muted">ليس لديك حساب؟ <Link to="/register">سجّل الآن</Link></p>
        </form>
      </div>
    </div>
  );
}

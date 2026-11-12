import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { extractError } from '../../api/client';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';

function strength(p: string): { score: number; label: string; color: string } {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[a-z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  const map = [
    { score: 0, label: 'ضعيفة', color: '#ef4444' },
    { score: 1, label: 'ضعيفة', color: '#ef4444' },
    { score: 2, label: 'متوسطة', color: '#f59e0b' },
    { score: 3, label: 'جيدة', color: '#10b981' },
    { score: 4, label: 'قوية', color: '#10b981' },
    { score: 5, label: 'قوية جداً', color: '#10b981' },
  ];
  return map[s]!;
}

export function RegisterPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState<'USER' | 'EDITOR'>('USER');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const s = strength(password);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!acceptTerms) { setError('يجب الموافقة على الشروط'); return; }
    setBusy(true);
    try {
      await authApi.register({ email, password, name, type, acceptTerms: true });
      toast.success('تم التسجيل — تحقق من بريدك');
      navigate('/login');
    } catch (err) { setError(extractError(err).message); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <h1 className="text-3xl font-bold mb-2 text-center">إنشاء حساب</h1>
        <p className="text-muted mb-6 text-center">انضم إلى NEXUS</p>
        <form onSubmit={submit} className="flex flex-col gap-4 bg-white p-6 rounded shadow">
          {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 8, fontSize: 14 }}>{error}</div>}
          <Input label="الاسم" value={name} onChange={e => setName(e.target.value)} required />
          <Input label="البريد الإلكتروني" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <div>
            <Input label="كلمة المرور" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
            {password && (
              <div style={{ marginTop: 8 }}>
                <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(s.score / 5) * 100}%`, background: s.color, transition: 'width .3s' }} />
                </div>
                <p className="text-sm mt-2" style={{ color: s.color }}>القوة: {s.label}</p>
              </div>
            )}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>نوع الحساب</label>
            <select value={type} onChange={e => setType(e.target.value as 'USER' | 'EDITOR')} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
              <option value="USER">مستخدم</option>
              <option value="EDITOR">محرر</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} />
            أوافق على <Link to="/terms" target="_blank">الشروط</Link>
          </label>
          <Button type="submit" loading={busy}>تسجيل</Button>
          <p className="text-center text-sm text-muted">لديك حساب؟ <Link to="/login">دخول</Link></p>
        </form>
      </div>
    </div>
  );
}

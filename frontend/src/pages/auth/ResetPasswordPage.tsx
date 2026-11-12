import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { extractError } from '../../api/client';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';

export function ResetPasswordPage() {
  const [sp] = useSearchParams();
  const token = sp.get('token') ?? '';
  const toast = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await authApi.resetPassword(token, password);
      toast.success('تم إعادة التعيين');
      navigate('/login');
    } catch (err) { setError(extractError(err).message); }
    finally { setBusy(false); }
  };

  if (!token) return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">رابط غير صالح</h1>
      <Link to="/forgot-password">طلب رابط جديد</Link>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <h1 className="text-2xl font-bold mb-6 text-center">إعادة تعيين كلمة المرور</h1>
        <form onSubmit={submit} className="flex flex-col gap-4 bg-white p-6 rounded shadow">
          {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 8, fontSize: 14 }}>{error}</div>}
          <Input label="كلمة المرور الجديدة" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
          <Button type="submit" loading={busy}>تعيين</Button>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { extractError } from '../../api/client';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try { await authApi.forgotPassword(email); setSent(true); }
    catch (err) { setError(extractError(err).message); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <h1 className="text-2xl font-bold mb-6 text-center">نسيت كلمة المرور</h1>
        <form onSubmit={submit} className="flex flex-col gap-4 bg-white p-6 rounded shadow">
          {sent ? (
            <>
              <div style={{ background: '#d1fae5', color: '#065f46', padding: 16, borderRadius: 8 }}>إن كان البريد مسجلاً، ستصلك رسالة إعادة التعيين.</div>
              <Link to="/login" className="text-center">العودة للدخول</Link>
            </>
          ) : (
            <>
              {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 8, fontSize: 14 }}>{error}</div>}
              <Input label="البريد الإلكتروني" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
              <Button type="submit" loading={busy}>إرسال رابط الاستعادة</Button>
              <Link to="/login" className="text-center text-sm">العودة للدخول</Link>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

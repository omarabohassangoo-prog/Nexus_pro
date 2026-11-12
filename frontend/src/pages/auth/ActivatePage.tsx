import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { extractError } from '../../api/client';
import { Spinner } from '../../components/ui/Spinner';

export function ActivatePage() {
  const [sp] = useSearchParams();
  const token = sp.get('token') ?? '';
  const [state, setState] = useState<'loading' | 'ok' | 'err'>('loading');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!token) { setState('err'); setMsg('رابط غير صالح'); return; }
    authApi.activate(token)
      .then(() => { setState('ok'); setMsg('تم تنشيط حسابك'); })
      .catch(e => { setState('err'); setMsg(extractError(e).message); });
  }, [token]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        {state === 'loading' && <Spinner size={40} />}
        {state === 'ok' && <><h1 className="text-2xl font-bold text-success mb-4">✅ {msg}</h1><Link to="/login">دخول</Link></>}
        {state === 'err' && <><h1 className="text-2xl font-bold text-danger mb-4">❌ {msg}</h1><Link to="/login">دخول</Link></>}
      </div>
    </div>
  );
}

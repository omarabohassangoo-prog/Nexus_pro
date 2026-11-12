import { useState } from 'react';
import { publicApi } from '../../api/public.api';
import { extractError } from '../../api/client';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';

export function ContactPage() {
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await publicApi.contact({ name, email, message });
      toast.success('تم استلام رسالتك');
      setName(''); setEmail(''); setMessage('');
    } catch (e) { toast.error(extractError(e).message); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <h1 className="text-3xl font-bold mb-6">اتصل بنا</h1>
      <form onSubmit={submit} className="flex flex-col gap-4 bg-white p-6 rounded shadow">
        <Input label="الاسم" value={name} onChange={e => setName(e.target.value)} required />
        <Input label="البريد" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>الرسالة</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} required minLength={10} style={{ width: '100%', minHeight: 120, padding: 12, border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontFamily: 'inherit' }} />
        </div>
        <Button type="submit" loading={busy}>إرسال</Button>
      </form>
    </div>
  );
}

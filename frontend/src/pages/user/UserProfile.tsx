import { useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import { userApi } from '../../api/user.api';
import { extractError } from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function UserProfile() {
  const { user, refresh } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await userApi.updateProfile({ name, phone: phone || null });
      await refresh();
      toast.success('تم الحفظ');
    } catch (e) { toast.error(extractError(e).message); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <h1 className="text-2xl font-bold mb-4">الملف الشخصي</h1>
      <div className="bg-white p-4 rounded shadow flex flex-col gap-4">
        <Input label="الاسم" value={name} onChange={e => setName(e.target.value)} />
        <Input label="الهاتف" value={phone} onChange={e => setPhone(e.target.value)} />
        <Input label="البريد" value={user?.email ?? ''} disabled />
        <Button onClick={save} loading={busy}>حفظ</Button>
      </div>
    </div>
  );
}

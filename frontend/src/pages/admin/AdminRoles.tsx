import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin.api';
import type { Role, Permission } from '../../types/models.types';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';

export function AdminRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.roles(), adminApi.permissions()])
      .then(([r, p]) => { setRoles(r); setPermissions(p); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center p-6"><Spinner size={40} /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">الأدوار والصلاحيات</h1>
      {roles.map(role => (
        <div key={role.id} className="bg-white p-4 rounded shadow mb-4">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-bold">{role.name}</h3>
            {role.isSystem && <Badge color="info">نظامي</Badge>}
            <span className="text-sm text-muted">{role._count?.users ?? 0} مستخدم</span>
          </div>
          <p className="text-sm text-muted mb-2">{role.description}</p>
          <div className="flex gap-1 flex-wrap">
            {role.permissions?.slice(0, 10).map(p => <Badge key={p.permission.id}>{p.permission.key}</Badge>)}
            {(role.permissions?.length ?? 0) > 10 && <Badge>+{(role.permissions?.length ?? 0) - 10}</Badge>}
          </div>
        </div>
      ))}
      <p className="text-sm text-muted mt-4">إجمالي الصلاحيات المتاحة: {permissions.length}</p>
    </div>
  );
}

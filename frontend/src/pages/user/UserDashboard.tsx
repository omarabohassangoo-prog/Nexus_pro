import { useAuth } from '../../auth/useAuth';

export function UserDashboard() {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">مرحباً، {user?.name}</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">ملفي</h3>
          <p className="text-sm text-muted">{user?.email}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">آخر دخول</h3>
          <p className="text-sm text-muted">{user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('ar') : '—'}</p>
        </div>
      </div>
    </div>
  );
}

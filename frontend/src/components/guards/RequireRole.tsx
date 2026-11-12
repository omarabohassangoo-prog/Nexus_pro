import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../auth/useAuth';
import type { UserType } from '../../types/models.types';
import { Spinner } from '../ui/Spinner';

export function RequireRole({ roles, children }: { roles: UserType[]; children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6 flex justify-center"><Spinner size={40} /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.type)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

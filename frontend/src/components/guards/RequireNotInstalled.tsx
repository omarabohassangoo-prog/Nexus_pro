import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { installApi } from '../../api/install.api';
import { Spinner } from '../ui/Spinner';

export function RequireNotInstalled({ children }: { children: ReactNode }) {
  const [state, setState] = useState<'loading' | 'not-installed' | 'installed' | 'error'>('loading');

  useEffect(() => {
    installApi.status()
      .then(s => setState(s.installed ? 'installed' : 'not-installed'))
      .catch(() => setState('error'));
  }, []);

  if (state === 'loading') return <div className="p-6 flex justify-center"><Spinner size={40} /></div>;
  if (state === 'installed') return <Navigate to="/login" replace />;
  return <>{children}</>;
}

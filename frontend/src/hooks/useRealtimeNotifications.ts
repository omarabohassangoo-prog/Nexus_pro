import { useEffect } from 'react';
import { useSocket } from './useSocket';
import { useToast } from './useToast';

export function useRealtimeNotifications(onNew?: (payload: unknown) => void) {
  const { on } = useSocket();
  const toast = useToast();

  useEffect(() => {
    const off1 = on('notification:new', payload => {
      const p = payload as { title: string; body: string };
      toast.info(`${p.title}: ${p.body}`);
      onNew?.(payload);
    });
    const off2 = on('session:revoked', () => {
      toast.warning('انتهت جلستك');
      setTimeout(() => { window.location.href = '/login'; }, 1000);
    });
    return () => { off1(); off2(); };
  }, [on, toast, onNew]);
}

// ═══════════════════════════════════════════════════════
// Vercel Stub — Polling-based notifications
// ═══════════════════════════════════════════════════════
import { useEffect, useRef } from 'react';
import { api } from '../api/client';
import type { ApiResponse } from '../types/api.types';
import { useToast } from './useToast';

const POLL_INTERVAL = 30000; // 30 ثانية

export function useRealtimeNotifications(onNew?: (payload: unknown) => void) {
  const toast = useToast();
  const lastCountRef = useRef<number>(-1);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await api.get<ApiResponse<{ count: number }>>('/user/notifications/unread-count');
        const count = res.data.data?.count ?? 0;
        if (lastCountRef.current !== -1 && count > lastCountRef.current) {
          toast.info(`لديك ${count - lastCountRef.current} إشعار جديد`);
          onNew?.({ count });
        }
        lastCountRef.current = count;
      } catch { /* ignore */ }
    };

    poll();
    const id = setInterval(() => { if (!cancelled) poll(); }, POLL_INTERVAL);
    return () => { cancelled = true; clearInterval(id); };
  }, [toast, onNew]);
}

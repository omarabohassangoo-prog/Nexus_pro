// ═══════════════════════════════════════════════════════
// Vercel Stub — WebSocket غير مدعوم على Vercel
// استبدل useSocket.ts بهذا الملف على Vercel
// ═══════════════════════════════════════════════════════
import { useCallback, useMemo } from 'react';

type Handler = (...args: unknown[]) => void;

const STUB_MESSAGE = 'WebSocket غير متاح على Vercel — استخدم polling أو Railway/Render للخادم';

export function useSocket() {
  const on = useCallback((_event: string, _handler: Handler) => {
    console.warn(STUB_MESSAGE);
    return () => { /* noop */ };
  }, []);

  const emit = useCallback((_event: string, _payload?: unknown, _cb?: (...args: unknown[]) => void) => {
    console.warn(STUB_MESSAGE);
  }, []);

  return useMemo(() => ({ socket: null, connected: false, on, emit }), [on, emit]);
}

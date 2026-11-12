import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAccessToken } from '../api/client';

type Handler = (...args: unknown[]) => void;

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef<Map<string, Set<Handler>>>(new Map());

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const socket = io('/', {
      path: '/ws',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', err => { console.warn('ws connect_error:', err.message); setConnected(false); });

    socket.onAny((event: string, ...args: unknown[]) => {
      const set = listenersRef.current.get(event);
      if (set) for (const h of set) h(...args);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, []);

  const on = useCallback((event: string, handler: Handler) => {
    let set = listenersRef.current.get(event);
    if (!set) { set = new Set(); listenersRef.current.set(event, set); }
    set.add(handler);
    return () => { const s = listenersRef.current.get(event); s?.delete(handler); };
  }, []);

  const emit = useCallback((event: string, payload?: unknown, cb?: (...args: unknown[]) => void) => {
    socketRef.current?.emit(event, payload, cb);
  }, []);

  return { socket: socketRef.current, connected, on, emit };
}

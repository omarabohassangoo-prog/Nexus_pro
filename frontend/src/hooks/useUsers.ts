import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../api/admin.api';
import { extractError } from '../api/client';
import type { SafeUser } from '../types/models.types';
import type { PaginationMeta } from '../types/api.types';

interface Filters { page: number; pageSize: number; search?: string; type?: string; status?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'; }

export function useUsers(initial: Filters) {
  const [filters, setFilters] = useState<Filters>(initial);
  const [items, setItems] = useState<SafeUser[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.users(filters as unknown as Record<string, unknown>);
      setItems(res.items);
      setMeta(res.meta);
    } catch (e) {
      setError(extractError(e).message);
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { void load(); }, [load]);

  return { filters, setFilters, items, meta, loading, error, reload: load };
}

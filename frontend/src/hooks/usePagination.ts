import { useState } from 'react';

export function usePagination(initialPage = 1, initialPageSize = 20) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const setPageSize = (n: number) => { setPageSizeState(n); setPage(1); };
  return { page, pageSize, setPage, setPageSize };
}

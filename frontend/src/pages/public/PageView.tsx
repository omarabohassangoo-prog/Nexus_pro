import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi } from '../../api/public.api';
import { extractError } from '../../api/client';
import type { Page } from '../../types/models.types';
import { Spinner } from '../../components/ui/Spinner';

export function PageView() {
  const { slug = '' } = useParams();
  const [page, setPage] = useState<Page | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    publicApi.page(slug)
      .then(p => { setPage(p); document.title = p.metaTitle ?? p.title; })
      .catch(e => setError(extractError(e).message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="p-6 flex justify-center"><Spinner size={40} /></div>;
  if (error || !page) return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">404</h1>
      <p className="text-muted mb-4">{error ?? 'الصفحة غير موجودة'}</p>
      <Link to="/">العودة للرئيسية</Link>
    </div>
  );

  return (
    <article style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
    </article>
  );
}

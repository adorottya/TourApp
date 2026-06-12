import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listBlogs } from '../../api/blogs';
import { PageShell } from '../../components/layout/PageShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import type { BlogResponse } from '../../types/blog';
import './BlogListPage.css';

export function BlogListPage() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') ?? '1');
  const [blogs, setBlogs] = useState<BlogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    listBlogs(page).then(setBlogs).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [page]);

  return (
    <PageShell
      title="Blogs"
      actions={<Link to="/blogs/create"><Button size="sm">Write Blog</Button></Link>}
    >
      {loading && <Spinner />}
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
      {!loading && !error && (
        <>
          <div className="blog-grid">
            {blogs.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No blogs yet.</p>}
            {blogs.map(b => (
              <Link to={`/blogs/${b.id}`} key={b.id} className="blog-card-link">
                <Card className="blog-card">
                  {b.pictures[0] && <img src={b.pictures[0]} alt={b.title} className="blog-card__img" />}
                  <div className="blog-card__body">
                    <h3 className="blog-card__title">{b.title}</h3>
                    <p className="blog-card__desc">{b.description.slice(0, 110)}{b.description.length > 110 ? '…' : ''}</p>
                    <span className="blog-card__meta">by {b.authorId} · {new Date(b.createdAt).toLocaleDateString()}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          <div className="blog-pagination">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setParams({ page: String(page - 1) })}>← Prev</Button>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Page {page}</span>
            <Button variant="secondary" size="sm" disabled={blogs.length < 20} onClick={() => setParams({ page: String(page + 1) })}>Next →</Button>
          </div>
        </>
      )}
    </PageShell>
  );
}

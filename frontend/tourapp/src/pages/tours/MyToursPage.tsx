import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { myTours, updateTour } from '../../api/tours';
import { PageShell } from '../../components/layout/PageShell';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import type { Tour } from '../../types/tour';
import './MyToursPage.css';

function statusVariant(s: string) {
  if (s === 'PUBLISHED') return 'primary';
  if (s === 'ARCHIVED') return 'accent';
  return 'muted';
}

export function MyToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<Record<string, string>>({});

  useEffect(() => {
    myTours().then(setTours).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  async function handlePublish(id: string) {
    const raw = priceInputs[id] ?? '';
    const price = parseFloat(raw);
    if (raw.trim() === '' || isNaN(price) || price < 0) {
      setPublishError(p => ({ ...p, [id]: 'Enter a valid price (0 or more)' }));
      return;
    }
    setPublishError(p => ({ ...p, [id]: '' }));
    setPublishingId(id);
    try {
      const updated = await updateTour(id, { status: 'PUBLISHED', price });
      setTours(prev => prev.map(t => (t.id === id ? updated : t)));
    } catch (err: unknown) {
      setPublishError(p => ({ ...p, [id]: err instanceof Error ? err.message : 'Failed to publish' }));
    } finally {
      setPublishingId(null);
    }
  }

  return (
    <PageShell title="My Tours" actions={<Link to="/my-tours/create"><Button size="sm">+ New Tour</Button></Link>}>
      {loading && <Spinner />}
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
      {!loading && !error && (
        <div className="my-tours-list">
          {tours.some(t => t.status === 'DRAFT') && (
            <Card className="my-tours-hint">
              <p>
                <strong>Draft tours are private.</strong> Tourists only see tours after you publish them
                (set a price and click Publish).
              </p>
            </Card>
          )}
          {tours.length === 0 && <p style={{ color: 'var(--text-muted)' }}>You haven't created any tours yet.</p>}
          {tours.map(t => (
            <Card key={t.id} className="my-tour-row">
              <div className="my-tour-row__main">
                <div>
                  <h3>{t.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
                    {t.description.slice(0, 80)}{t.description.length > 80 ? '…' : ''}
                  </p>
                </div>
                <div className="my-tour-row__meta">
                  <Badge variant={statusVariant(t.status)}>{t.status}</Badge>
                  <span className="my-tour-price">{t.price === 0 ? 'Free' : `$${t.price.toFixed(2)}`}</span>
                </div>
              </div>
              <div className="my-tour-row__actions">
                <Link to={`/my-tours/${t.id}/keypoints`}>
                  <Button variant="secondary" size="sm">Keypoints</Button>
                </Link>
                <Link to={`/my-tours/${t.id}/edit`}>
                  <Button variant="secondary" size="sm">Edit</Button>
                </Link>
                {t.status === 'DRAFT' && (
                  <div className="my-tour-publish">
                    <Input
                      id={`price-${t.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Price"
                      value={priceInputs[t.id] ?? ''}
                      onChange={e => setPriceInputs(p => ({ ...p, [t.id]: e.target.value }))}
                    />
                    <Button
                      size="sm"
                      disabled={publishingId === t.id}
                      onClick={() => handlePublish(t.id)}
                    >
                      {publishingId === t.id ? '…' : 'Publish'}
                    </Button>
                    {publishError[t.id] && (
                      <span className="my-tour-publish-error">{publishError[t.id]}</span>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}

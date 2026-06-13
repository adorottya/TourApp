import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { addToCart, getCart } from '../../api/cart';
import { listPublished } from '../../api/tours';
import { PageShell } from '../../components/layout/PageShell';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../context/AuthContext';
import type { Tour } from '../../types/tour';
import './TourListPage.css';

function difficultyVariant(d: string) {
  if (d === 'EASY') return 'primary';
  if (d === 'MEDIUM') return 'accent';
  return 'danger';
}

export function TourListPage() {
  const { isTourist } = useAuth();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedTours] = await Promise.all([
          listPublished(),
          isTourist
            ? getCart().then(cart => setAddedIds(new Set(cart.items.map(i => i.tourId)))).catch(() => {})
            : Promise.resolve(),
        ]);
        setTours(fetchedTours);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load tours');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isTourist]);

  async function handleAddToCart(tourId: string) {
    setAddingId(tourId);
    try {
      await addToCart(tourId);
      setAddedIds(s => new Set(s).add(tourId));
    } catch { /* ignore */ } finally {
      setAddingId(null);
    }
  }

  return (
    <PageShell title="Explore Tours">
      {loading && <Spinner />}
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
      {!loading && !error && (
        <div className="tour-grid">
          {tours.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No published tours.</p>}
          {tours.map(t => (
            <Card key={t.id} className="tour-card">
              <div className="tour-card__header">
                <Link to={`/tours/${t.id}`}><h3>{t.name}</h3></Link>
                <Badge variant={difficultyVariant(t.difficulty)}>{t.difficulty}</Badge>
              </div>
              <p className="tour-card__desc">{t.description.slice(0, 100)}{t.description.length > 100 ? '…' : ''}</p>
              <div className="tour-card__tags">
                {t.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
              </div>
              <div className="tour-card__footer">
                <span className="tour-card__price">{t.price === 0 ? 'Free' : `$${t.price.toFixed(2)}`}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/tours/${t.id}`}><Button variant="secondary" size="sm">View</Button></Link>
                  {isTourist && (
                    <Button size="sm"
                      disabled={addingId === t.id || addedIds.has(t.id)}
                      onClick={() => handleAddToCart(t.id)}>
                      {addedIds.has(t.id) ? '✓ Added' : addingId === t.id ? '…' : 'Add to Cart'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}

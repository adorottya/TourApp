import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { myTours } from '../../api/tours';
import { PageShell } from '../../components/layout/PageShell';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
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

  useEffect(() => {
    myTours().then(setTours).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  return (
    <PageShell title="My Tours" actions={<Link to="/my-tours/create"><Button size="sm">+ New Tour</Button></Link>}>
      {loading && <Spinner />}
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
      {!loading && !error && (
        <div className="my-tours-list">
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
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}

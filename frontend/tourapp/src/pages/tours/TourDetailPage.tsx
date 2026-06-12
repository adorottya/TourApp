import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { addToCart } from '../../api/cart';
import { getKeypoints, getTour } from '../../api/tours';
import { PageShell } from '../../components/layout/PageShell';
import { KeypointMarker } from '../../components/map/KeypointMarker';
import { LeafletMap } from '../../components/map/LeafletMap';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../context/AuthContext';
import type { Keypoint, Tour } from '../../types/tour';
import './TourDetailPage.css';

export function TourDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isTourist } = useAuth();
  const [tour, setTour] = useState<Tour | null>(null);
  const [keypoints, setKeypoints] = useState<Keypoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([getTour(id), getKeypoints(id)])
      .then(([t, kps]) => { setTour(t); setKeypoints(kps); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAddToCart() {
    if (!id) return;
    setAdding(true);
    try { await addToCart(id); setAdded(true); } catch { /* ignore */ } finally { setAdding(false); }
  }

  if (loading) return <PageShell><Spinner /></PageShell>;
  if (!tour) return <PageShell><p style={{ color: 'var(--danger)' }}>Tour not found.</p></PageShell>;

  const mapCenter: [number, number] = keypoints.length > 0
    ? [keypoints[0].latitude, keypoints[0].longitude]
    : [45.267136, 19.833549];

  return (
    <PageShell title={tour.name}>
      <div className="tour-detail">
        <div className="tour-detail__info">
          <Card>
            <div className="tour-detail__badges">
              <Badge variant={tour.difficulty === 'EASY' ? 'primary' : tour.difficulty === 'MEDIUM' ? 'accent' : 'danger'}>
                {tour.difficulty}
              </Badge>
              <Badge variant="muted">{tour.status}</Badge>
            </div>
            <p style={{ color: 'var(--text-muted)', margin: '12px 0', lineHeight: 1.6 }}>{tour.description}</p>
            <div className="tour-detail__tags">
              {tour.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
            </div>
            <div className="tour-detail__price">
              <span className="tour-detail__price-label">Price</span>
              <span className="tour-detail__price-value">{tour.price === 0 ? 'Free' : `$${tour.price.toFixed(2)}`}</span>
            </div>
            {isTourist && tour.status === 'PUBLISHED' && (
              <Button onClick={handleAddToCart} disabled={adding || added} style={{ marginTop: 16 }}>
                {added ? '✓ Added to Cart' : adding ? '…' : 'Add to Cart'}
              </Button>
            )}
          </Card>

          {keypoints.length > 0 && (
            <div className="tour-detail__keypoints">
              <h2>Keypoints</h2>
              {keypoints.sort((a, b) => a.orderIndex - b.orderIndex).map(kp => (
                <Card key={kp.id} className="keypoint-item">
                  <div className="keypoint-item__header">
                    <span className="keypoint-num">{kp.orderIndex}</span>
                    <strong>{kp.name}</strong>
                  </div>
                  {kp.description && <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4 }}>{kp.description}</p>}
                  {kp.image && <img src={kp.image} alt={kp.name} style={{ marginTop: 8, borderRadius: 4, maxHeight: 120 }} />}
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="tour-detail__map">
          <LeafletMap center={mapCenter} zoom={13} height="450px">
            {keypoints.map(kp => <KeypointMarker key={kp.id} keypoint={kp} />)}
          </LeafletMap>
        </div>
      </div>
    </PageShell>
  );
}

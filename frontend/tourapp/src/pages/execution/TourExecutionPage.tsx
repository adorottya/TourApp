import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getPurchaseTokens } from '../../api/cart';
import {
  abandonExecution, completeExecution,
  getActiveExecution, startExecution,
} from '../../api/executions';
import { getLatestPosition } from '../../api/position';
import { getKeypoints, getTour } from '../../api/tours';
import { PageShell } from '../../components/layout/PageShell';
import { KeypointMarker } from '../../components/map/KeypointMarker';
import { KeypointPath } from '../../components/map/KeypointPath';
import { LeafletMap } from '../../components/map/LeafletMap';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import type { TourExecution } from '../../types/execution';
import type { TourPurchaseToken } from '../../types/cart';
import type { Keypoint, Tour } from '../../types/tour';
import './TourExecutionPage.css';

const KEYPOINT_RADIUS_METERS = 200;

const posIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

export function TourExecutionPage() {
  const [execution, setExecution] = useState<TourExecution | null>(null);
  const [tour, setTour] = useState<Tour | null>(null);
  const [keypoints, setKeypoints] = useState<Keypoint[]>([]);
  const [visitedIds, setVisitedIds] = useState<string[]>([]);
  const [position, setPosition] = useState<{ lat: number; lon: number } | null>(null);
  const [tokens, setTokens] = useState<TourPurchaseToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const refreshProgress = useCallback(async () => {
    setRefreshing(true);
    try {
      const ex = await getActiveExecution();
      setExecution(ex);
      setVisitedIds(ex.visitedKeypoints ?? []);
      const [t, kps, pos] = await Promise.all([
        getTour(ex.tourId),
        getKeypoints(ex.tourId),
        getLatestPosition().catch(() => null),
      ]);
      setTour(t);
      setKeypoints(kps.sort((a, b) => a.orderIndex - b.orderIndex));
      if (pos) setPosition({ lat: pos.latitude, lon: pos.longitude });
      setError('');
    } catch (err: unknown) {
      if (execution) {
        setError(err instanceof Error ? err.message : 'Failed to refresh');
      }
    } finally {
      setRefreshing(false);
    }
  }, [execution]);

  useEffect(() => {
    Promise.all([
      getActiveExecution().then(loadExecution).catch(() => {}),
      getPurchaseTokens().then(setTokens).catch(() => setTokens([])),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onFocus = () => { if (execution) refreshProgress(); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [execution, refreshProgress]);

  async function loadExecution(ex: TourExecution) {
    setExecution(ex);
    setVisitedIds(ex.visitedKeypoints ?? []);
    const [t, kps, pos] = await Promise.all([
      getTour(ex.tourId),
      getKeypoints(ex.tourId),
      getLatestPosition().catch(() => null),
    ]);
    setTour(t);
    setKeypoints(kps.sort((a, b) => a.orderIndex - b.orderIndex));
    if (pos) setPosition({ lat: pos.latitude, lon: pos.longitude });
  }

  async function handleStart(token: TourPurchaseToken) {
    setStartingId(token.id);
    setError('');
    try {
      const ex = await startExecution(token.id);
      await loadExecution(ex);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start execution');
    } finally {
      setStartingId(null);
    }
  }

  async function handleComplete() {
    if (!execution) return;
    try {
      await completeExecution(execution.id);
      setExecution(null);
      setTour(null);
      setKeypoints([]);
      setVisitedIds([]);
      const updated = await getPurchaseTokens();
      setTokens(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to complete tour');
    }
  }

  async function handleAbandon() {
    if (!execution) return;
    if (!confirm('Abandon this tour?')) return;
    try {
      await abandonExecution(execution.id);
      setExecution(null);
      setTour(null);
      setKeypoints([]);
      setVisitedIds([]);
      const updated = await getPurchaseTokens();
      setTokens(updated);
    } catch { /* ignore */ }
  }

  if (loading) return <PageShell><Spinner /></PageShell>;

  if (!execution) {
    return (
      <PageShell title="Tour Execution">
        <Card className="execution-steps">
          <h3>How it works</h3>
          <ol>
            <li><strong>Start Tour</strong> — pick a purchased tour below</li>
            <li><strong>Simulator</strong> — go to Position Simulator, click near a keypoint, record position</li>
            <li><strong>Repeat</strong> — visit every keypoint (within {KEYPOINT_RADIUS_METERS}m)</li>
            <li><strong>Complete</strong> — return here when all keypoints are checked off</li>
          </ol>
        </Card>
        {error && <p style={{ color: 'var(--danger)', marginBottom: 12 }}>{error}</p>}
        {tokens.length === 0 ? (
          <Card style={{ maxWidth: 520 }}>
            <p style={{ color: 'var(--text-muted)' }}>
              No purchased tours yet. Add tours to your cart and checkout first.
            </p>
          </Card>
        ) : (
          <div className="token-list">
            {tokens.map(token => (
              <Card key={token.id} className="token-card">
                <div className="token-card__info">
                  <h3>{token.tourName}</h3>
                  <p className="token-card__meta">
                    Purchased {new Date(token.purchasedAt).toLocaleString()}
                    {token.price === 0 ? ' · Free' : ` · $${token.price.toFixed(2)}`}
                  </p>
                </div>
                <Button size="sm" disabled={startingId === token.id} onClick={() => handleStart(token)}>
                  {startingId === token.id ? 'Starting…' : 'Start Tour'}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </PageShell>
    );
  }

  const mapCenter: [number, number] = position
    ? [position.lat, position.lon]
    : keypoints.length > 0
    ? [keypoints[0].latitude, keypoints[0].longitude]
    : [45.267136, 19.833549];

  const allVisited = keypoints.length > 0 && visitedIds.length >= keypoints.length;

  return (
    <PageShell title={tour?.name ?? 'Active Tour'}>
      <Card className="execution-steps execution-steps--compact">
        <p>
          Go to <Link to="/simulator"><strong>Position Simulator</strong></Link>, record your position at each keypoint,
          then come back here. Progress updates when you record.
        </p>
      </Card>

      <div className="execution-layout">
        <div className="execution-map">
          <LeafletMap center={mapCenter} zoom={14} height="520px">
            <KeypointPath keypoints={keypoints} />
            {keypoints.map(kp => (
              <Circle
                key={`ring-${kp.id}`}
                center={[kp.latitude, kp.longitude]}
                radius={KEYPOINT_RADIUS_METERS}
                pathOptions={visitedIds.includes(kp.id)
                  ? { color: '#4a7c4e', fillColor: '#4a7c4e', fillOpacity: 0.08, weight: 1.5, dashArray: '4 5' }
                  : { color: '#b85c38', fillColor: '#b85c38', fillOpacity: 0.08, weight: 1.5, dashArray: '4 5' }
                }
              />
            ))}
            {keypoints.map(kp => (
              <KeypointMarker key={kp.id} keypoint={kp} visited={visitedIds.includes(kp.id)} />
            ))}
            {position && (
              <Marker position={[position.lat, position.lon]} icon={posIcon}>
                <Popup>Your last recorded position</Popup>
              </Marker>
            )}
          </LeafletMap>
        </div>

        <div className="execution-panel">
          <Card className="execution-status">
            <div className="execution-status__header">
              <Badge variant="primary">{execution.status}</Badge>
            </div>
            <div className="execution-progress">
              <span className="progress-label">Keypoints reached</span>
              <span className="progress-value">{visitedIds.length} / {keypoints.length}</span>
              <div className="progress-bar">
                <div
                  className="progress-bar__fill"
                  style={{ width: keypoints.length > 0 ? `${(visitedIds.length / keypoints.length) * 100}%` : '0%' }}
                />
              </div>
            </div>
            {allVisited && (
              <p style={{ fontSize: '0.875rem', color: 'var(--primary)', marginTop: 10, fontWeight: 600 }}>
                ✓ All keypoints reached!
              </p>
            )}
            {error && <p style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: 8 }}>{error}</p>}
          </Card>

          <div className="execution-actions">
            <Link to="/simulator"><Button variant="secondary">Open Simulator</Button></Link>
            <Button variant="secondary" disabled={refreshing} onClick={refreshProgress}>
              {refreshing ? '…' : 'Refresh Progress'}
            </Button>
            <Button onClick={handleComplete} disabled={!allVisited}>✓ Complete Tour</Button>
            <Button variant="danger" onClick={handleAbandon}>Abandon</Button>
          </div>

          {keypoints.length > 0 && (
            <Card>
              <h3 style={{ marginBottom: 10 }}>Keypoints</h3>
              {keypoints.map(kp => (
                <div key={kp.id} className={`kp-status-row ${visitedIds.includes(kp.id) ? 'kp-status-row--visited' : ''}`}>
                  <span className="kp-status-icon">{visitedIds.includes(kp.id) ? '✓' : '○'}</span>
                  <span>{kp.orderIndex}. {kp.name}</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </PageShell>
  );
}

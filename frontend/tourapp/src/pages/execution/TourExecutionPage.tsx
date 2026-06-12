import { useEffect, useRef, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  abandonExecution, checkKeypoints, completeExecution,
  getActiveExecution, startExecution, updateExecutionPosition,
} from '../../api/executions';
import { getLatestPosition } from '../../api/position';
import { getKeypoints, getTour } from '../../api/tours';
import { PageShell } from '../../components/layout/PageShell';
import { KeypointMarker } from '../../components/map/KeypointMarker';
import { LeafletMap } from '../../components/map/LeafletMap';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import type { TourExecution } from '../../types/execution';
import type { Keypoint, Tour } from '../../types/tour';
import './TourExecutionPage.css';

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
  const [loading, setLoading] = useState(true);
  const [tokenInput, setTokenInput] = useState('');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Try to load active execution on mount
  useEffect(() => {
    getActiveExecution()
      .then(ex => loadExecution(ex))
      .catch(() => {})
      .finally(() => setLoading(false));

    // Also pre-fill token from localStorage if available
    try {
      const stored = localStorage.getItem('purchaseTokens');
      if (stored) {
        const tokens = JSON.parse(stored) as Array<{ id: string }>;
        if (tokens.length > 0) setTokenInput(tokens[0].id);
      }
    } catch { /* ignore */ }
  }, []);

  async function loadExecution(ex: TourExecution) {
    setExecution(ex);
    setVisitedIds(ex.visitedKeypoints);
    const [t, kps, pos] = await Promise.all([
      getTour(ex.tourId),
      getKeypoints(ex.tourId),
      getLatestPosition().catch(() => null),
    ]);
    setTour(t);
    setKeypoints(kps);
    if (pos) setPosition({ lat: pos.latitude, lon: pos.longitude });
    startPolling(ex.id);
  }

  function startPolling(exId: string) {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(async () => {
      try {
        const pos = await getLatestPosition();
        setPosition({ lat: pos.latitude, lon: pos.longitude });
        await updateExecutionPosition(exId, pos.latitude, pos.longitude);
        const result = await checkKeypoints(exId);
        setVisitedIds(result.visitedKeypoints);
      } catch { /* ignore polling errors */ }
    }, 10000);
  }

  function stopPolling() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }

  useEffect(() => () => stopPolling(), []);

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    setStarting(true);
    setError('');
    try {
      const ex = await startExecution(tokenInput.trim());
      await loadExecution(ex);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start execution');
    } finally {
      setStarting(false);
    }
  }

  async function handleComplete() {
    if (!execution) return;
    try {
      await completeExecution(execution.id);
      stopPolling();
      setExecution(null); setTour(null); setKeypoints([]); setVisitedIds([]);
    } catch { /* ignore */ }
  }

  async function handleAbandon() {
    if (!execution) return;
    if (!confirm('Abandon this tour?')) return;
    try {
      await abandonExecution(execution.id);
      stopPolling();
      setExecution(null); setTour(null); setKeypoints([]); setVisitedIds([]);
    } catch { /* ignore */ }
  }

  if (loading) return <PageShell><Spinner /></PageShell>;

  if (!execution) {
    return (
      <PageShell title="Start a Tour">
        <Card style={{ maxWidth: 480 }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: '0.875rem' }}>
            Enter a purchase token ID to begin. Tokens are obtained after checkout.
          </p>
          <form onSubmit={handleStart} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input id="token" label="Purchase Token ID" value={tokenInput}
              onChange={e => setTokenInput(e.target.value)} required />
            {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{error}</p>}
            <Button type="submit" disabled={starting}>{starting ? 'Starting…' : 'Start Tour'}</Button>
          </form>
        </Card>
      </PageShell>
    );
  }

  const mapCenter: [number, number] = position
    ? [position.lat, position.lon]
    : keypoints.length > 0
    ? [keypoints[0].latitude, keypoints[0].longitude]
    : [45.267136, 19.833549];

  return (
    <PageShell title={tour?.name ?? 'Active Tour'}>
      <div className="execution-layout">
        <div className="execution-map">
          <LeafletMap center={mapCenter} zoom={14} height="520px">
            {keypoints.map(kp => (
              <KeypointMarker key={kp.id} keypoint={kp} visited={visitedIds.includes(kp.id)} />
            ))}
            {position && (
              <Marker position={[position.lat, position.lon]} icon={posIcon}>
                <Popup>Your current position</Popup>
              </Marker>
            )}
          </LeafletMap>
        </div>

        <div className="execution-panel">
          <Card className="execution-status">
            <div className="execution-status__header">
              <Badge variant="primary">{execution.status}</Badge>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Started {new Date(execution.startedAt).toLocaleTimeString()}
              </span>
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
            {position && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8 }}>
                Position: {position.lat.toFixed(5)}, {position.lon.toFixed(5)}
              </p>
            )}
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Updates every 10 seconds automatically.
            </p>
          </Card>

          <div className="execution-actions">
            <Button onClick={handleComplete}
              disabled={visitedIds.length < keypoints.length && keypoints.length > 0}>
              ✓ Complete Tour
            </Button>
            <Button variant="danger" onClick={handleAbandon}>Abandon</Button>
          </div>

          {keypoints.length > 0 && (
            <Card>
              <h3 style={{ marginBottom: 10 }}>Keypoints</h3>
              {keypoints.sort((a, b) => a.orderIndex - b.orderIndex).map(kp => (
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

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getActiveExecution } from '../../api/executions';
import { getLatestPosition, recordPosition } from '../../api/position';
import { getKeypoints, getTour } from '../../api/tours';
import { PageShell } from '../../components/layout/PageShell';
import { KeypointMarker } from '../../components/map/KeypointMarker';
import { LeafletMap } from '../../components/map/LeafletMap';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import type { TouristPosition } from '../../types/execution';
import type { Keypoint, Tour } from '../../types/tour';
import './PositionSimulatorPage.css';

const KEYPOINT_RADIUS_METERS = 200;

const currentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const pendingIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

export function PositionSimulatorPage() {
  const [current, setCurrent] = useState<TouristPosition | null>(null);
  const [pending, setPending] = useState<{ lat: number; lon: number } | null>(null);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState('');
  const [tour, setTour] = useState<Tour | null>(null);
  const [keypoints, setKeypoints] = useState<Keypoint[]>([]);
  const [visitedIds, setVisitedIds] = useState<string[]>([]);

  useEffect(() => {
    getLatestPosition().then(setCurrent).catch(() => {});
    getActiveExecution()
      .then(async ex => {
        setVisitedIds(ex.visitedKeypoints ?? []);
        const [t, kps] = await Promise.all([getTour(ex.tourId), getKeypoints(ex.tourId)]);
        setTour(t);
        setKeypoints(kps.sort((a, b) => a.orderIndex - b.orderIndex));
      })
      .catch(() => {});
  }, []);

  function handleMapClick(lat: number, lon: number) {
    setPending({ lat, lon });
    setStatus('');
  }

  async function handleRecord() {
    if (!pending) return;
    setRecording(true);
    try {
      const result = await recordPosition(pending.lat, pending.lon);
      setCurrent(result.position);
      setPending(null);

      if (result.executionProgress) {
        const visited = result.executionProgress.visitedKeypoints ?? [];
        setVisitedIds(visited);
        const total = result.executionProgress.totalKeypoints;
        const prevCount = visitedIds.length;
        const newCount = visited.length - prevCount;
        if (newCount > 0) {
          setStatus(`✓ Keypoint reached! Progress: ${visited.length} / ${total}`);
        } else if (visited.length >= total && total > 0) {
          setStatus(`✓ All ${total} keypoints reached! Go to Execution to complete the tour.`);
        } else {
          setStatus(`Position recorded, but no keypoint within ${KEYPOINT_RADIUS_METERS}m. Try clicking closer to a marker.`);
        }
      } else {
        setStatus(`Position recorded at ${new Date(result.position.recordedAt).toLocaleTimeString()}. Start a tour on Execution first.`);
      }
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Failed to record');
    } finally {
      setRecording(false);
    }
  }

  const mapCenter: [number, number] = current
    ? [current.latitude, current.longitude]
    : pending
    ? [pending.lat, pending.lon]
    : keypoints.length > 0
    ? [keypoints[0].latitude, keypoints[0].longitude]
    : [45.267136, 19.833549];

  return (
    <PageShell title="Position Simulator">
      {tour ? (
        <Card className="simulator-active-tour">
          <p><strong>Active tour:</strong> {tour.name}</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Progress: {visitedIds.length} / {keypoints.length} keypoints
          </p>
          <p style={{ fontSize: '0.875rem', marginTop: 8, lineHeight: 1.5 }}>
            Click near each numbered keypoint on the map, then <strong>Record This Position</strong>.
            Repeat for every keypoint, then return to <Link to="/execution">Execution</Link> to finish.
          </p>
        </Card>
      ) : (
        <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: '0.875rem', lineHeight: 1.6 }}>
          Start a tour on the <Link to="/execution">Execution</Link> page first, then come here to simulate
          visiting each keypoint.
        </p>
      )}

      <div className="simulator-layout">
        <div className="simulator-map">
          <LeafletMap center={mapCenter} zoom={14} height="500px" onClick={handleMapClick}>
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
            {current && (
              <Marker position={[current.latitude, current.longitude]} icon={currentIcon}>
                <Popup>
                  <strong>You are here</strong>
                  <br />
                  {current.latitude.toFixed(5)}, {current.longitude.toFixed(5)}
                </Popup>
              </Marker>
            )}
            {pending && (
              <Marker position={[pending.lat, pending.lon]} icon={pendingIcon}>
                <Popup>Pending — click Record to save</Popup>
              </Marker>
            )}
          </LeafletMap>
        </div>

        <div className="simulator-panel">
          {keypoints.length > 0 && (
            <Card>
              <h3 style={{ marginBottom: 8 }}>Keypoints</h3>
              {keypoints.map(kp => (
                <div key={kp.id} className={`sim-kp-row ${visitedIds.includes(kp.id) ? 'sim-kp-row--done' : ''}`}>
                  <span>{visitedIds.includes(kp.id) ? '✓' : '○'}</span>
                  <span>{kp.orderIndex}. {kp.name}</span>
                </div>
              ))}
            </Card>
          )}

          {current && (
            <Card className="simulator-current">
              <h3>Current Position</h3>
              <p className="coord">{current.latitude.toFixed(6)}</p>
              <p className="coord">{current.longitude.toFixed(6)}</p>
            </Card>
          )}

          {pending && (
            <Card className="simulator-pending">
              <h3>New Location</h3>
              <p className="coord">{pending.lat.toFixed(6)}</p>
              <p className="coord">{pending.lon.toFixed(6)}</p>
              <button className="record-btn" onClick={handleRecord} disabled={recording}>
                {recording ? 'Recording…' : '📍 Record This Position'}
              </button>
              <button className="cancel-btn" onClick={() => setPending(null)}>Cancel</button>
            </Card>
          )}

          {status && <p className="simulator-status">{status}</p>}

          {tour && (
            <Link to="/execution">
              <Button style={{ width: '100%' }}>← Back to Execution</Button>
            </Link>
          )}
        </div>
      </div>
    </PageShell>
  );
}

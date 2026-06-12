import { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getLatestPosition, recordPosition } from '../../api/position';
import { PageShell } from '../../components/layout/PageShell';
import { LeafletMap } from '../../components/map/LeafletMap';
import { Card } from '../../components/ui/Card';
import type { TouristPosition } from '../../types/execution';
import './PositionSimulatorPage.css';

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

  useEffect(() => {
    getLatestPosition().then(setCurrent).catch(() => {});
  }, []);

  function handleMapClick(lat: number, lon: number) {
    setPending({ lat, lon });
    setStatus('');
  }

  async function handleRecord() {
    if (!pending) return;
    setRecording(true);
    try {
      const pos = await recordPosition(pending.lat, pending.lon);
      setCurrent(pos);
      setPending(null);
      setStatus(`Position recorded at ${new Date(pos.recordedAt).toLocaleTimeString()}`);
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
    : [45.267136, 19.833549];

  return (
    <PageShell title="Position Simulator">
      <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: '0.875rem' }}>
        Click on the map to set your simulated position. This is used during tour execution.
      </p>
      <div className="simulator-layout">
        <div className="simulator-map">
          <LeafletMap center={mapCenter} zoom={13} height="500px" onClick={handleMapClick}>
            {current && (
              <Marker position={[current.latitude, current.longitude]} icon={currentIcon}>
                <Popup>
                  <strong>You are here</strong>
                  <br />
                  {current.latitude.toFixed(5)}, {current.longitude.toFixed(5)}
                  <br />
                  <small>{new Date(current.recordedAt).toLocaleString()}</small>
                </Popup>
              </Marker>
            )}
            {pending && (
              <Marker position={[pending.lat, pending.lon]} icon={pendingIcon}>
                <Popup>Pending — click "Record" to save</Popup>
              </Marker>
            )}
          </LeafletMap>
        </div>

        <div className="simulator-panel">
          {current && (
            <Card className="simulator-current">
              <h3>Current Position</h3>
              <p className="coord">{current.latitude.toFixed(6)}</p>
              <p className="coord">{current.longitude.toFixed(6)}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Last recorded: {new Date(current.recordedAt).toLocaleString()}
              </p>
            </Card>
          )}
          {pending && (
            <Card className="simulator-pending">
              <h3>New Location</h3>
              <p className="coord">{pending.lat.toFixed(6)}</p>
              <p className="coord">{pending.lon.toFixed(6)}</p>
              <button
                className="record-btn"
                onClick={handleRecord}
                disabled={recording}
              >
                {recording ? 'Recording…' : '📍 Record This Position'}
              </button>
              <button className="cancel-btn" onClick={() => setPending(null)}>Cancel</button>
            </Card>
          )}
          {status && <p className="simulator-status">{status}</p>}
          {!current && !pending && (
            <Card>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No position recorded yet. Click on the map to set your location.
              </p>
            </Card>
          )}
        </div>
      </div>
    </PageShell>
  );
}

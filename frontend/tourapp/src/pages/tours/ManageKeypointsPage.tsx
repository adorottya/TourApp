import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { addKeypoint, deleteKeypoint, getKeypoints, getTour, reorderKeypoints } from '../../api/tours';
import { PageShell } from '../../components/layout/PageShell';
import { LeafletMap } from '../../components/map/LeafletMap';
import { KeypointPath } from '../../components/map/KeypointPath';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { Textarea } from '../../components/ui/Textarea';
import type { Keypoint, Tour } from '../../types/tour';
import './ManageKeypointsPage.css';

const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

export function ManageKeypointsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tour, setTour] = useState<Tour | null>(null);
  const [keypoints, setKeypoints] = useState<Keypoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<{ lat: number; lon: number } | null>(null);
  const [form, setForm] = useState({ name: '', description: '', image: '' });
  const [adding, setAdding] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([getTour(id), getKeypoints(id)])
      .then(([t, kps]) => {
        setTour(t);
        setKeypoints([...kps].sort((a, b) => a.orderIndex - b.orderIndex));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  function handleMapClick(lat: number, lon: number) {
    setSelected({ lat, lon });
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !selected) return;
    setAdding(true);
    setError('');
    try {
      const kp = await addKeypoint(id, {
        name: form.name,
        description: form.description,
        latitude: selected.lat,
        longitude: selected.lon,
        image: form.image || undefined,
      });
      setKeypoints(prev => [...prev, kp].sort((a, b) => a.orderIndex - b.orderIndex));
      setSelected(null);
      setForm({ name: '', description: '', image: '' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add keypoint');
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(kpId: string) {
    if (!id) return;
    try {
      await deleteKeypoint(id, kpId);
      const updated = await getKeypoints(id);
      setKeypoints(updated.sort((a, b) => a.orderIndex - b.orderIndex));
    } catch { /* ignore */ }
  }

  async function moveKeypoint(kpId: string, direction: 'up' | 'down') {
    if (!id) return;
    const sorted = [...keypoints].sort((a, b) => a.orderIndex - b.orderIndex);
    const idx = sorted.findIndex(k => k.id === kpId);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const ids = sorted.map(k => k.id);
    [ids[idx], ids[swapIdx]] = [ids[swapIdx], ids[idx]];

    setReordering(true);
    try {
      const updated = await reorderKeypoints(id, ids);
      setKeypoints(updated.sort((a, b) => a.orderIndex - b.orderIndex));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reorder');
    } finally {
      setReordering(false);
    }
  }

  if (loading) return <PageShell><Spinner /></PageShell>;
  if (!tour) return <PageShell><p style={{ color: 'var(--danger)' }}>Tour not found.</p></PageShell>;

  const sorted = [...keypoints].sort((a, b) => a.orderIndex - b.orderIndex);
  const mapCenter: [number, number] = sorted.length > 0
    ? [sorted[0].latitude, sorted[0].longitude]
    : [45.267136, 19.833549];

  return (
    <PageShell title={`Keypoints: ${tour.name}`} actions={
      <Button variant="secondary" size="sm" onClick={() => navigate('/my-tours')}>← Back</Button>
    }>
      <div className="kp-layout">
        <div className="kp-map-col">
          <LeafletMap center={mapCenter} zoom={13} height="440px" onClick={handleMapClick}>
            <KeypointPath keypoints={sorted} />
            {sorted.map(kp => (
              <Marker key={kp.id} position={[kp.latitude, kp.longitude]}>
                <Popup><strong>{kp.orderIndex}. {kp.name}</strong></Popup>
              </Marker>
            ))}
            {selected && (
              <Marker position={[selected.lat, selected.lon]} icon={selectedIcon}>
                <Popup>New keypoint location</Popup>
              </Marker>
            )}
          </LeafletMap>
          {selected ? (
            <Card className="kp-add-form">
              <h3>Add Keypoint #{sorted.length + 1} at {selected.lat.toFixed(5)}, {selected.lon.toFixed(5)}</h3>
              <form onSubmit={handleAdd} className="kp-form-fields">
                <Input id="kp-name" label="Name" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                <Textarea id="kp-desc" label="Description" value={form.description} rows={2}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                <Input id="kp-image" label="Image URL (optional)" value={form.image}
                  onChange={e => setForm(f => ({ ...f, image: e.target.value }))} />
                {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{error}</p>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button type="submit" size="sm" disabled={adding}>{adding ? '…' : 'Add Keypoint'}</Button>
                  <Button type="button" variant="secondary" size="sm" onClick={() => setSelected(null)}>Cancel</Button>
                </div>
              </form>
            </Card>
          ) : (
            <p className="kp-hint">Click on the map to place the next keypoint. Order is assigned automatically.</p>
          )}
        </div>

        <div className="kp-list-col">
          <h2>Keypoints ({sorted.length})</h2>
          <p className="kp-order-hint">Use ↑ ↓ to change visit order on the tour route.</p>
          {sorted.length === 0 && <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>No keypoints yet. Click the map to add one.</p>}
          {sorted.map((kp, idx) => (
            <Card key={kp.id} className="kp-row">
              <div className="kp-row__header">
                <span className="kp-order">{kp.orderIndex}</span>
                <strong>{kp.name}</strong>
                <div className="kp-row__actions">
                  <Button variant="secondary" size="sm" disabled={reordering || idx === 0}
                    onClick={() => moveKeypoint(kp.id, 'up')}>↑</Button>
                  <Button variant="secondary" size="sm" disabled={reordering || idx === sorted.length - 1}
                    onClick={() => moveKeypoint(kp.id, 'down')}>↓</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(kp.id)}>Delete</Button>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {kp.latitude.toFixed(5)}, {kp.longitude.toFixed(5)}
              </p>
              {kp.description && <p style={{ fontSize: '0.875rem', marginTop: 4 }}>{kp.description}</p>}
              {kp.image && <img src={kp.image} alt={kp.name} style={{ marginTop: 6, maxHeight: 80, borderRadius: 4 }} />}
            </Card>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

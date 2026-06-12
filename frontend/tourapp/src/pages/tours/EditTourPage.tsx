import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTour, updateTour } from '../../api/tours';
import { PageShell } from '../../components/layout/PageShell';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { Textarea } from '../../components/ui/Textarea';
import './TourForm.css';

export function EditTourPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '', difficulty: 'EASY', status: 'DRAFT', price: '0', tagInput: '', tags: [] as string[] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getTour(id).then(t => {
      setForm({ name: t.name, description: t.description, difficulty: t.difficulty, status: t.status, price: String(t.price), tagInput: '', tags: t.tags });
    }).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [id]);

  function addTag() {
    const t = form.tagInput.trim();
    if (t && !form.tags.includes(t)) setForm(f => ({ ...f, tags: [...f.tags, t], tagInput: '' }));
    else setForm(f => ({ ...f, tagInput: '' }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError('');
    try {
      await updateTour(id, { name: form.name, description: form.description, difficulty: form.difficulty, tags: form.tags, status: form.status, price: Number(form.price) });
      navigate('/my-tours');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update tour');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageShell><Spinner /></PageShell>;

  return (
    <PageShell title="Edit Tour">
      <Card style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit} className="tour-form">
          <Input id="name" label="Tour Name" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Textarea id="description" label="Description" value={form.description} rows={4}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
          <div className="input-group">
            <label className="input-label" htmlFor="difficulty">Difficulty</label>
            <select id="difficulty" className="tour-select" value={form.difficulty}
              onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="status">Status</label>
            <select id="status" className="tour-select" value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <Input id="price" label="Price ($)" type="number" min="0" step="0.01" value={form.price}
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
          <div className="input-group">
            <label className="input-label">Tags</label>
            <div className="tag-input-row">
              <input className="input-field" value={form.tagInput} placeholder="Add tag…"
                onChange={e => setForm(f => ({ ...f, tagInput: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
              <Button type="button" variant="secondary" size="sm" onClick={addTag}>Add</Button>
            </div>
            {form.tags.length > 0 && (
              <div className="tag-chips">
                {form.tags.map(tag => (
                  <span key={tag} className="tag-chip">
                    <Badge>{tag}</Badge>
                    <button type="button" className="tag-chip__remove"
                      onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))}>✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/my-tours')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTour } from '../../api/tours';
import { PageShell } from '../../components/layout/PageShell';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import './TourForm.css';

export function CreateTourPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '', difficulty: 'EASY', tagInput: '', tags: [] as string[] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function addTag() {
    const t = form.tagInput.trim();
    if (t && !form.tags.includes(t)) setForm(f => ({ ...f, tags: [...f.tags, t], tagInput: '' }));
    else setForm(f => ({ ...f, tagInput: '' }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const tour = await createTour({ name: form.name, description: form.description, difficulty: form.difficulty, tags: form.tags });
      navigate(`/my-tours/${tour.id}/keypoints`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create tour');
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell title="Create Tour">
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
            <Button type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create Tour'}</Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/my-tours')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}

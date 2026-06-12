import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBlog } from '../../api/blogs';
import { PageShell } from '../../components/layout/PageShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import './CreateBlogPage.css';

export function CreateBlogPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', pictures: [''] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function addPicture() { setForm(f => ({ ...f, pictures: [...f.pictures, ''] })); }
  function removePicture(i: number) { setForm(f => ({ ...f, pictures: f.pictures.filter((_, idx) => idx !== i) })); }
  function setPicture(i: number, val: string) {
    setForm(f => { const pics = [...f.pictures]; pics[i] = val; return { ...f, pictures: pics }; });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const blog = await createBlog({ ...form, pictures: form.pictures.filter(Boolean) });
      navigate(`/blogs/${blog.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create blog');
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell title="Write a Blog">
      <Card style={{ maxWidth: 680 }}>
        <form onSubmit={handleSubmit} className="create-blog-form">
          <Input id="title" label="Title" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          <Textarea id="description" label="Content" value={form.description} rows={8}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
          <div className="create-blog-pictures">
            <span className="input-label">Pictures (URLs)</span>
            {form.pictures.map((url, i) => (
              <div key={i} className="picture-row">
                <Input value={url} placeholder="https://…"
                  onChange={e => setPicture(i, e.target.value)} />
                <Button type="button" variant="secondary" size="sm" onClick={() => removePicture(i)}
                  disabled={form.pictures.length === 1}>✕</Button>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={addPicture}>+ Add picture</Button>
          </div>
          {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <Button type="submit" disabled={saving}>{saving ? 'Publishing…' : 'Publish'}</Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/blogs')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}

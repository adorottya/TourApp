import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../../api/users';
import { PageShell } from '../../components/layout/PageShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { Textarea } from '../../components/ui/Textarea';
import './EditProfilePage.css';

export function EditProfilePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', profilePicture: '', biography: '', motto: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getProfile().then(u => {
      setForm({
        firstName: u.firstName ?? '',
        lastName: u.lastName ?? '',
        profilePicture: u.profilePicture ?? '',
        biography: u.biography ?? '',
        motto: u.motto ?? '',
      });
    }).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateProfile(form);
      navigate('/profile');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageShell><Spinner /></PageShell>;

  return (
    <PageShell title="Edit Profile">
      <Card style={{ maxWidth: 560 }}>
        <form onSubmit={handleSubmit} className="edit-profile-form">
          <Input id="firstName" label="First Name" value={form.firstName}
            onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
          <Input id="lastName" label="Last Name" value={form.lastName}
            onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
          <Input id="profilePicture" label="Profile Picture URL" value={form.profilePicture}
            onChange={e => setForm(f => ({ ...f, profilePicture: e.target.value }))} />
          <Textarea id="biography" label="Biography" value={form.biography} rows={4}
            onChange={e => setForm(f => ({ ...f, biography: e.target.value }))} />
          <Input id="motto" label="Motto" value={form.motto}
            onChange={e => setForm(f => ({ ...f, motto: e.target.value }))} />
          {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{error}</p>}
          <div className="edit-profile-actions">
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/profile')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}

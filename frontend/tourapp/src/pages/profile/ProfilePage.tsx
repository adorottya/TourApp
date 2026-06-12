import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProfile } from '../../api/users';
import { PageShell } from '../../components/layout/PageShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import type { User } from '../../types/user';
import './ProfilePage.css';

export function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getProfile().then(setUser).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageShell><Spinner /></PageShell>;
  if (error) return <PageShell><p style={{ color: 'var(--danger)' }}>{error}</p></PageShell>;
  if (!user) return null;

  return (
    <PageShell title="My Profile" actions={<Link to="/profile/edit"><Button variant="secondary" size="sm">Edit Profile</Button></Link>}>
      <Card className="profile-card">
        <div className="profile-avatar">
          {user.profilePicture
            ? <img src={user.profilePicture} alt={user.username} className="profile-avatar__img" />
            : <div className="profile-avatar__placeholder">{user.username[0].toUpperCase()}</div>
          }
        </div>
        <div className="profile-info">
          <div className="profile-row">
            <span className="profile-label">Username</span>
            <span>{user.username}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Email</span>
            <span>{user.email}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Role</span>
            <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
          </div>
          {(user.firstName || user.lastName) && (
            <div className="profile-row">
              <span className="profile-label">Name</span>
              <span>{[user.firstName, user.lastName].filter(Boolean).join(' ')}</span>
            </div>
          )}
          {user.biography && (
            <div className="profile-row profile-row--block">
              <span className="profile-label">Biography</span>
              <p className="profile-bio">{user.biography}</p>
            </div>
          )}
          {user.motto && (
            <div className="profile-row">
              <span className="profile-label">Motto</span>
              <em style={{ color: 'var(--text-muted)' }}>"{user.motto}"</em>
            </div>
          )}
        </div>
      </Card>
    </PageShell>
  );
}

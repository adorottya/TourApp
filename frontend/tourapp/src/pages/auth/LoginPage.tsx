import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import './AuthPage.css';

export function LoginPage() {
  const { login: setAuth, isAuthenticated, isGuide } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate(isGuide ? '/my-tours' : '/tours', { replace: true });
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(form);
      setAuth(res);
      navigate(res.user.role === 'guide' ? '/my-tours' : '/tours', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <h2 className="auth-title">Welcome back</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            id="username" label="Username" value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            autoFocus required
          />
          <Input
            id="password" label="Password" type="password" value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
          />
          {error && <p className="auth-error">{error}</p>}
          <Button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
        <p className="auth-footer">No account? <Link to="/register">Register</Link></p>
      </Card>
    </div>
  );
}

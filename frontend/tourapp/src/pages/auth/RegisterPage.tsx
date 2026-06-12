import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, register } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import './AuthPage.css';

export function RegisterPage() {
  const { login: setAuth } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'tourist' as 'tourist' | 'guide' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      const res = await login({ username: form.username, password: form.password });
      setAuth(res);
      navigate(res.user.role === 'guide' ? '/my-tours' : '/tours', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <h2 className="auth-title">Create account</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            id="username" label="Username" value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            autoFocus required
          />
          <Input
            id="email" label="Email" type="email" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
          />
          <Input
            id="password" label="Password" type="password" value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
          />
          <div className="auth-roles">
            <span className="input-label">I am a…</span>
            <label className={`role-option ${form.role === 'tourist' ? 'role-option--active' : ''}`}>
              <input type="radio" name="role" value="tourist" checked={form.role === 'tourist'}
                onChange={() => setForm(f => ({ ...f, role: 'tourist' }))} />
              Tourist
            </label>
            <label className={`role-option ${form.role === 'guide' ? 'role-option--active' : ''}`}>
              <input type="radio" name="role" value="guide" checked={form.role === 'guide'}
                onChange={() => setForm(f => ({ ...f, role: 'guide' }))} />
              Guide
            </label>
          </div>
          {error && <p className="auth-error">{error}</p>}
          <Button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>
        <p className="auth-footer">Have an account? <Link to="/login">Sign in</Link></p>
      </Card>
    </div>
  );
}

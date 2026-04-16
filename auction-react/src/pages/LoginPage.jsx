import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

export default function LoginPage() {
  const [tab, setTab]     = useState('user'); // 'user' | 'admin'
  const [form, setForm]   = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'admin') {
        const res = await api.adminLogin({ username: form.username, password: form.password });
        if (!res || !res.id) {
          setError('Invalid admin credentials');
          return;
        }
        sessionStorage.setItem('adminId',  res.id);
        sessionStorage.setItem('username', res.username);
        sessionStorage.setItem('role',     'ADMIN');
        nav('/admin');
      } else {
        const res = await api.login({ username: form.username, password: form.password });
        if (!res || !res.id) {
          setError('Invalid credentials');
          return;
        }
        sessionStorage.setItem('userId',   res.id);
        sessionStorage.setItem('username', res.username);
        sessionStorage.setItem('role',     'USER');
        nav('/dashboard');
      }
    } catch {
      setError('Login failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🏷 AuctionHub</h1>

        {/* Tab toggle */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'user' ? 'active' : ''}`}
            onClick={() => { setTab('user'); setError(''); }}
            type="button"
          >
            User Login
          </button>
          <button
            className={`auth-tab ${tab === 'admin' ? 'active' : ''}`}
            onClick={() => { setTab('admin'); setError(''); }}
            type="button"
          >
            Admin Login
          </button>
        </div>

        <form onSubmit={handleLogin}>
          <input
            placeholder="Username"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : `Login as ${tab === 'admin' ? 'Admin' : 'User'}`}
          </button>
        </form>

        {tab === 'user' && (
          <p className="auth-footer">
            No account? <Link to="/signup">Sign up</Link>
          </p>
        )}
      </div>
    </div>
  );
}

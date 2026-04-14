import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function LoginPage() {
  const [form, setForm]   = useState({ username: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const nav = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    try {
      if (form.role === 'admin') {
        const admin = await api.adminLogin({ username: form.username, password: form.password });
        if (!admin || !admin.id) { setError('Invalid admin credentials'); return; }
        // sessionStorage — isolated per tab
        sessionStorage.setItem('adminId', admin.id);
        sessionStorage.setItem('username', admin.username);
        nav('/admin');
      } else {
        const user = await api.login({ username: form.username, password: form.password });
        if (!user || !user.id) { setError('Invalid credentials'); return; }
        sessionStorage.setItem('userId', user.id);
        sessionStorage.setItem('username', user.username);
        nav('/dashboard');
      }
    } catch {
      setError('Login failed. Check backend is running.');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🏷 AuctionHub</h1>
        <h2>Sign In</h2>
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
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary">Login</button>
        </form>
      </div>
    </div>
  );
}

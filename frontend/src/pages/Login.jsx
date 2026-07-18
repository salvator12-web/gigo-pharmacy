import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/shop');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e8f5ee 0%, #f0fdf4 100%)' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: 24 }}>
        <div className="card" style={{ padding: 40 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 56, height: 56, background: '#1a7a4a', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, margin: '0 auto 16px' }}>💊</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#1a7a4a' }}>GIGO Pharmacy</h1>
            <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Sign in to your account</p>
          </div>
          {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>{error}</div>}
          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '12px' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' }}>
            Don't have an account? <Link to="/register" style={{ color: '#1a7a4a', fontWeight: 500 }}>Register</Link>
          </p>
          <div style={{ marginTop: 24, padding: 16, background: '#f0fdf4', borderRadius: 8, fontSize: 12, color: '#4b5563' }}>
            <strong>Demo accounts:</strong><br />
            Admin: admin@gigo.com / admin123<br />
            Customer: customer@gigo.com / customer123
          </div>
        </div>
      </div>
    </div>
  );
}

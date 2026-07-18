import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await register(form);
      navigate('/shop');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e8f5ee 0%, #f0fdf4 100%)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div className="card" style={{ padding: 40 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 56, height: 56, background: '#1a7a4a', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, margin: '0 auto 16px' }}>💊</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: '#1a7a4a' }}>Create Account</h1>
          </div>
          {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>{error}</div>}
          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[['name','Full Name','text'],['email','Email','email'],['password','Password','password'],['phone','Phone Number','text'],['address','Delivery Address','text']].map(([key, label, type]) => (
              <div key={key}>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required={key !== 'phone'} />
              </div>
            ))}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 8 }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' }}>
            Already have an account? <Link to="/login" style={{ color: '#1a7a4a', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

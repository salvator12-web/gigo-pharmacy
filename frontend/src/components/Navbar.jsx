import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, background: '#1a7a4a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16 }}>G</div>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1a7a4a' }}>GIGO Pharmacy</span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {user ? (
          <>
            <span style={{ fontSize: 14, color: '#4b5563' }}>👋 {user.name}</span>
            {user.role === 'admin' && <Link to="/admin" className="btn btn-secondary btn-sm">Admin Panel</Link>}
            {user.role === 'customer' && <Link to="/shop" className="btn btn-secondary btn-sm">🛍 Shop</Link>}
            {user.role === 'customer' && <Link to="/my-orders" className="btn btn-secondary btn-sm">My Orders</Link>}
            <button onClick={handleLogout} className="btn btn-danger btn-sm">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

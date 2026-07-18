import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div>
        <p style={{ fontSize: 80, marginBottom: 16 }}>💊</p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, color: '#1a7a4a' }}>404</h1>
        <p style={{ color: '#6b7280', marginBottom: 24 }}>Page not found</p>
        <Link to="/" className="btn btn-primary">Go Home</Link>
      </div>
    </div>
  );
}

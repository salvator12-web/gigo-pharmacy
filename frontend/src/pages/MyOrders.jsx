import { useState, useEffect } from 'react';
import api from '../utils/api';

const STATUS_LABELS = { PENDING: 'Pending', CONFIRMED: 'Confirmed', PREPARING: 'Preparing', OUT_FOR_DELIVERY: 'Out for Delivery', DELIVERED: 'Delivered', CANCELLED: 'Cancelled' };
const STATUS_CLASS = { PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed', PREPARING: 'badge-preparing', OUT_FOR_DELIVERY: 'badge-out', DELIVERED: 'badge-delivered', CANCELLED: 'badge-cancelled' };

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/orders/my').then(r => setOrders(r.data)).finally(() => setLoading(false)); }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: '#6b7280' }}>Loading orders...</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, color: '#1a7a4a', marginBottom: 24 }}>My Orders</h1>
      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>📦</p>
          <p style={{ color: '#6b7280' }}>No orders yet. Visit the shop to place your first order!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map(order => (
            <div key={order._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{order.orderNumber}</p>
                  <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`badge ${STATUS_CLASS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
              </div>
              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 14 }}>
                {order.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                    <span>{item.name} × {item.quantity}</span>
                    <span style={{ color: '#4b5563' }}>{(item.price * item.quantity).toLocaleString()} RWF</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #f3f4f6', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>Total</span>
                  <span style={{ color: '#1a7a4a' }}>{order.totalAmount.toLocaleString()} RWF</span>
                </div>
              </div>
              {order.deliveryAddress && <p style={{ fontSize: 13, color: '#6b7280', marginTop: 10 }}>📍 {order.deliveryAddress}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

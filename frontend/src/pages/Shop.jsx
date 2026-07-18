import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const CATEGORIES = ['All', 'Pain Relief', 'Antibiotics', 'Vitamins', 'Diabetes', 'Digestive', 'Allergy'];

export default function Shop() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [orderForm, setOrderForm] = useState({ deliveryAddress: '', customerPhone: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchMedicines(); }, [category, search]);
useEffect(() => {
    if (user) {
      const pending = sessionStorage.getItem('pendingCart');
      if (pending) {
        setCart(JSON.parse(pending));
        sessionStorage.removeItem('pendingCart');
        setShowCart(true);
      }
    }
  }, [user]);
  const fetchMedicines = async () => {
    try {
      const params = {};
      if (category !== 'All') params.category = category;
      if (search) params.search = search;
      const res = await api.get('/medicines', { params });
      setMedicines(res.data);
    } catch (err) { console.error(err); }
  };

  const addToCart = (med) => {
    setCart(prev => {
      const exists = prev.find(i => i.medicineId === med._id);
      if (exists) return prev.map(i => i.medicineId === med._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { medicineId: med._id, name: med.name, price: med.price, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.medicineId !== id));
  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCart(prev => prev.map(i => i.medicineId === id ? { ...i, quantity: qty } : i));
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

const placeOrder = async () => {
    if (!user) {
      sessionStorage.setItem('pendingCart', JSON.stringify(cart));
      return navigate('/login?redirect=/shop');
    }
    if (!orderForm.deliveryAddress) return setMsg('Please enter delivery address');
    setLoading(true);
    try {
      await api.post('/orders', {
        items: cart.map(i => ({ medicineId: i.medicineId, quantity: i.quantity })),
        deliveryAddress: orderForm.deliveryAddress,
        customerPhone: orderForm.customerPhone,
        customerName: user.name,
        notes: orderForm.notes,
      });
      setMsg('✅ Order placed successfully');
      setCart([]);
      setOrderForm({ deliveryAddress: '', customerPhone: '', notes: '' });
      setShowCart(false);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: '#1a7a4a' }}>Medicine Shop</h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Quality medicines delivered to your door</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCart(true)} style={{ position: 'relative' }}>
          🛒 Cart {cart.length > 0 && <span style={{ background: '#f4a435', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, marginLeft: 4 }}>{cart.reduce((s, i) => s + i.quantity, 0)}</span>}
        </button>
      </div>

      {msg && <div style={{ background: msg.startsWith('✅') ? '#d1fae5' : '#fee2e2', color: msg.startsWith('✅') ? '#065f46' : '#991b1b', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>{msg}</div>}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 250 }} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{ padding: '6px 14px', borderRadius: 20, border: '1.5px solid', borderColor: category === cat ? '#1a7a4a' : '#e5e7eb', background: category === cat ? '#1a7a4a' : 'white', color: category === cat ? 'white' : '#4b5563', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Medicines grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
        {medicines.map(med => (
          <div key={med._id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ width: 48, height: 48, background: '#e8f5ee', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>💊</div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1f2937' }}>{med.name}</h3>
              <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{med.category}</p>
              <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{med.description}</p>
            </div>
            {med.requiresPrescription && <span style={{ fontSize: 11, color: '#92400e', background: '#fef3c7', padding: '2px 8px', borderRadius: 10, alignSelf: 'flex-start' }}>Rx Required</span>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
              <div>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#1a7a4a' }}>{med.price} RWF</span>
                <p style={{ fontSize: 11, color: '#9ca3af' }}>Stock: {med.stock}</p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => addToCart(med)} disabled={med.stock === 0}>
                {med.stock === 0 ? 'Out of stock' : '+ Add'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: 480, height: '100%', overflowY: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>Your Cart</h2>
              <button onClick={() => setShowCart(false)} style={{ background: 'none', fontSize: 20, color: '#6b7280' }}>✕</button>
            </div>
            {cart.length === 0 ? <p style={{ color: '#6b7280', textAlign: 'center', marginTop: 60 }}>Your cart is empty</p> : (
              <>
                {cart.map(item => (
                  <div key={item.medicineId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: 14 }}>{item.name}</p>
                      <p style={{ fontSize: 13, color: '#6b7280' }}>{item.price} RWF each</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button onClick={() => updateQty(item.medicineId, item.quantity - 1)} style={{ width: 28, height: 28, border: '1px solid #e5e7eb', borderRadius: 6, background: 'white', fontSize: 16 }}>−</button>
                      <span style={{ fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateQty(item.medicineId, item.quantity + 1)} style={{ width: 28, height: 28, border: '1px solid #e5e7eb', borderRadius: 6, background: 'white', fontSize: 16 }}>+</button>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 24, padding: 16, background: '#f0fdf4', borderRadius: 10 }}>
                  <p style={{ fontWeight: 700, fontSize: 18, color: '#1a7a4a' }}>Total: {total.toLocaleString()} RWF</p>
                </div>
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600 }}>Delivery Details</h3>
                  <input type="text" placeholder="Delivery address *" value={orderForm.deliveryAddress} onChange={e => setOrderForm({ ...orderForm, deliveryAddress: e.target.value })} />
                  <input type="text" placeholder="Phone number" value={orderForm.customerPhone} onChange={e => setOrderForm({ ...orderForm, customerPhone: e.target.value })} />
                  <textarea placeholder="Notes (optional)" value={orderForm.notes} onChange={e => setOrderForm({ ...orderForm, notes: e.target.value })} style={{ height: 80, resize: 'none' }} />
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14 }} onClick={placeOrder} disabled={loading}>
                    {loading ? 'Placing order...' : '✅ Place Order'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

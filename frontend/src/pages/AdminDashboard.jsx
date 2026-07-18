import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';

const STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
const STATUS_CLASS = { PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed', PREPARING: 'badge-preparing', OUT_FOR_DELIVERY: 'badge-out', DELIVERED: 'badge-delivered', CANCELLED: 'badge-cancelled' };

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [medForm, setMedForm] = useState({ name: '', category: '', description: '', price: '', stock: '', unit: 'tablet', requiresPrescription: false, manufacturer: '', image: '' });
  const [editingMed, setEditingMed] = useState(null);
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [s, o, m] = await Promise.all([
      api.get('/orders/stats/summary'),
      api.get('/orders'),
      api.get('/medicines'),
    ]);
    setStats(s.data); setOrders(o.data); setMedicines(m.data);
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/orders/${id}/status`, { status });
    fetchAll();
  };

  const uploadImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { data: sig } = await api.post('/media/sign');

      const body = new FormData();
      body.append('file', file);
      body.append('api_key', sig.apiKey);
      body.append('timestamp', String(sig.timestamp));
      body.append('signature', sig.signature);
      body.append('folder', sig.folder);

      const uploadRes = await fetch(sig.uploadUrl, { method: 'POST', body });
      const asset = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(asset?.error?.message || 'Cloudinary upload failed');

      setMedForm(f => ({ ...f, image: asset.secure_url }));
    } catch (err) {
      setMsg(err.response?.data?.message || err.message || 'Image upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const saveMedicine = async () => {
    try {
      if (editingMed) {
        await api.put(`/medicines/${editingMed}`, medForm);
        setMsg('Medicine updated ✅');
      } else {
        await api.post('/medicines', medForm);
        setMsg('Medicine added ✅');
      }
      setMedForm({ name: '', category: '', description: '', price: '', stock: '', unit: 'tablet', requiresPrescription: false, manufacturer: '', image: '' });
      setEditingMed(null); fetchAll();
    } catch (err) { setMsg(err.response?.data?.message || 'Error saving medicine'); }
  };

  const deleteMedicine = async (id) => {
    if (!confirm('Delete this medicine?')) return;
    await api.delete(`/medicines/${id}`); fetchAll();
  };

  const editMedicine = (med) => {
    setMedForm({ name: med.name, category: med.category, description: med.description || '', price: med.price, stock: med.stock, unit: med.unit, requiresPrescription: med.requiresPrescription, manufacturer: med.manufacturer || '', image: med.image || '' });
    setEditingMed(med._id); setTab('medicines');
  };

  const seedAll = async () => {
    await api.post('/auth/seed');
    await api.post('/medicines/seed/data');
    setMsg('Demo data seeded ✅'); fetchAll();
  };

  const TAB = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{ padding: '10px 20px', border: 'none', background: tab === id ? '#1a7a4a' : 'transparent', color: tab === id ? 'white' : '#4b5563', borderRadius: 8, fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>{label}</button>
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: '#1a7a4a' }}>Admin Dashboard</h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Manage your pharmacy</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={seedAll}>🌱 Seed Demo Data</button>
      </div>

      {msg && <div style={{ background: msg.includes('✅') ? '#d1fae5' : '#fee2e2', color: msg.includes('✅') ? '#065f46' : '#991b1b', padding: '10px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>{msg}<button onClick={() => setMsg('')} style={{ float: 'right', background: 'none', fontSize: 16, cursor: 'pointer' }}>✕</button></div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, background: '#f3f4f6', padding: 6, borderRadius: 10, marginBottom: 28, width: 'fit-content' }}>
        <TAB id="overview" label="📊 Overview" />
        <TAB id="orders" label={`📦 Orders (${orders.length})`} />
        <TAB id="medicines" label={`💊 Medicines (${medicines.length})`} />
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Total Orders', value: stats.total || 0, icon: '📦', color: '#3b82f6' },
              { label: 'Pending', value: stats.pending || 0, icon: '⏳', color: '#f59e0b' },
              { label: 'Delivered', value: stats.delivered || 0, icon: '✅', color: '#10b981' },
              { label: 'Revenue', value: `${(stats.revenue || 0).toLocaleString()} RWF`, icon: '💰', color: '#8b5cf6' },
            ].map((s, i) => (
              <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: s.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{s.icon}</div>
                <div>
                  <p style={{ fontSize: 13, color: '#6b7280' }}>{s.label}</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Recent Orders</h3>
            {orders.slice(0, 5).map(order => (
              <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div>
                  <p style={{ fontWeight: 500, fontSize: 14 }}>{order.orderNumber}</p>
                  <p style={{ fontSize: 13, color: '#6b7280' }}>{order.customerName} • {order.totalAmount?.toLocaleString()} RWF</p>
                </div>
                <span className={`badge ${STATUS_CLASS[order.status]}`}>{order.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders */}
      {tab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {orders.map(order => (
            <div key={order._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <p style={{ fontWeight: 700 }}>{order.orderNumber}</p>
                  <p style={{ fontSize: 13, color: '#6b7280' }}>{order.customerName} • {order.customerPhone}</p>
                  <p style={{ fontSize: 13, color: '#6b7280' }}>📍 {order.deliveryAddress}</p>
                  <p style={{ fontSize: 13, color: '#4b5563', marginTop: 6 }}>{order.items?.map(i => `${i.name} ×${i.quantity}`).join(', ')}</p>
                  <p style={{ fontWeight: 700, color: '#1a7a4a', marginTop: 4 }}>{order.totalAmount?.toLocaleString()} RWF</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                  <span className={`badge ${STATUS_CLASS[order.status]}`}>{order.status}</span>
                  <select value={order.status} onChange={e => updateStatus(order._id, e.target.value)} style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
          {orders.length === 0 && <div className="card" style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>No orders yet</div>}
        </div>
      )}

      {/* Medicines */}
      {tab === 'medicines' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }}>
          {/* Form */}
          <div className="card" style={{ height: 'fit-content' }}>
            <h3 style={{ fontWeight: 600, marginBottom: 16 }}>{editingMed ? 'Edit Medicine' : 'Add Medicine'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[['name','Name'],['category','Category'],['description','Description'],['manufacturer','Manufacturer']].map(([k,l]) => (
                <div key={k}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>{l}</label>
                  <input type="text" value={medForm[k]} onChange={e => setMedForm({ ...medForm, [k]: e.target.value })} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Price (RWF)</label>
                  <input type="number" value={medForm.price} onChange={e => setMedForm({ ...medForm, price: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Stock</label>
                  <input type="number" value={medForm.stock} onChange={e => setMedForm({ ...medForm, stock: e.target.value })} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Unit</label>
                <select value={medForm.unit} onChange={e => setMedForm({ ...medForm, unit: e.target.value })}>
                  {['tablet','capsule','syrup','injection','cream','drops'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  {medForm.image && (
                    <img src={medForm.image} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                  )}
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? 'Uploading…' : medForm.image ? 'Replace image' : 'Upload image'}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={e => uploadImage(e.target.files?.[0])} />
                </div>
                <input type="text" placeholder="or paste an image URL…" value={medForm.image} onChange={e => setMedForm({ ...medForm, image: e.target.value })} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={medForm.requiresPrescription} onChange={e => setMedForm({ ...medForm, requiresPrescription: e.target.checked })} />
                Requires Prescription
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={saveMedicine}>{editingMed ? 'Update' : 'Add Medicine'}</button>
                {editingMed && <button className="btn btn-secondary" onClick={() => { setEditingMed(null); setMedForm({ name:'',category:'',description:'',price:'',stock:'',unit:'tablet',requiresPrescription:false,manufacturer:'',image:'' }); }}>Cancel</button>}
              </div>
            </div>
          </div>

          {/* Medicine list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {medicines.map(med => (
              <div key={med._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{med.name}</p>
                  <p style={{ fontSize: 13, color: '#6b7280' }}>{med.category} • {med.price} RWF • Stock: {med.stock}</p>
                  {med.requiresPrescription && <span style={{ fontSize: 11, color: '#92400e', background: '#fef3c7', padding: '2px 7px', borderRadius: 10 }}>Rx</span>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => editMedicine(med)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteMedicine(med._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vehiclesAPI } from '../api';
import { formatINR } from '../utils/currency';

const emptyForm = { make: '', model: '', category: '', price: '', quantity: '' };

export default function AdminPage() {
  const { logout } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [restockId, setRestockId] = useState(null);
  const [restockQty, setRestockQty] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const res = await vehiclesAPI.list();
      setVehicles(res.data.vehicles);
    } catch { setError('Failed to load vehicles'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setMessage('');
    const data = { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) };
    try {
      if (editId) { await vehiclesAPI.update(editId, data); setMessage('Vehicle updated successfully'); }
      else        { await vehiclesAPI.create(data);         setMessage('Vehicle created successfully'); }
      setForm(emptyForm); setEditId(null); load();
    } catch (err) { setError(err.response?.data?.error || 'Operation failed'); }
  }

  async function handleDelete(id) {
    setError(''); setMessage('');
    try { await vehiclesAPI.remove(id); setMessage('Vehicle deleted'); load(); }
    catch (err) { setError(err.response?.data?.error || 'Delete failed'); }
  }

  async function handleRestock(id) {
    setError(''); setMessage('');
    try {
      await vehiclesAPI.restock(id, parseInt(restockQty));
      setMessage('Stock updated successfully');
      setRestockId(null); setRestockQty(''); load();
    } catch (err) { setError(err.response?.data?.error || 'Restock failed'); }
  }

  function startEdit(v) {
    setEditId(v.id);
    setForm({ make: v.make, model: v.model, category: v.category, price: String(v.price), quantity: String(v.quantity) });
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() { setEditId(null); setForm(emptyForm); }
  const field = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <nav className="nav">
        <span className="nav-logo">⬡ AutoElite</span>
        <div className="nav-right">
          <span className="nav-role admin">ADMIN</span>
          <Link to="/dashboard" className="btn btn-secondary btn-sm">Dashboard</Link>
          <button onClick={logout} className="btn btn-ghost btn-sm">Sign Out</button>
        </div>
      </nav>

      <div className="page">
        <div className="page-header">
          <h1>Admin Panel</h1>
          <p>Manage vehicle inventory</p>
        </div>

        {error   && <div className="alert alert-error">⚠ {error}</div>}
        {message && <div className="alert alert-success">✓ {message}</div>}

        <div className="admin-layout">
          {/* ── Form ── */}
          <div className="card">
            <h2>{editId ? '✎ Edit Vehicle' : '+ Add Vehicle'}</h2>
            <form onSubmit={handleSubmit}>
              {[
                { key: 'make',     label: 'Make',     placeholder: 'e.g. Toyota' },
                { key: 'model',    label: 'Model',    placeholder: 'e.g. Camry' },
                { key: 'category', label: 'Category', placeholder: 'e.g. Sedan' },
              ].map(({ key, label, placeholder }) => (
                <div className="form-group" key={key}>
                  <label>{label}</label>
                  <input placeholder={placeholder} value={form[key]} onChange={field(key)} required />
                </div>
              ))}
              <div className="form-group">
                <label>Price (₹)</label>
                <input type="number" min="0" step="0.01" placeholder="25000" value={form.price} onChange={field('price')} required />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" min="0" placeholder="10" value={form.quantity} onChange={field('quantity')} required />
              </div>
              <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editId ? 'Update Vehicle' : 'Create Vehicle'}
                </button>
                {editId && <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>}
              </div>
            </form>
          </div>

          {/* ── Table ── */}
          <div className="card">
            <h2>
              Inventory
              <span className="count-badge">{vehicles.length}</span>
            </h2>
            {loading ? (
              <div className="loading-row"><span className="spinner" /> Loading…</div>
            ) : vehicles.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem 0' }}>
                <div className="icon">📋</div>
                <h3>No vehicles yet</h3>
                <p>Add your first vehicle using the form</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Vehicle</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((v) => (
                      <tr key={v.id}>
                        <td>
                          <strong>{v.make} {v.model}</strong>
                        </td>
                        <td><span className="vehicle-category">{v.category}</span></td>
                        <td style={{ color: 'var(--accent)', fontWeight: 600 }}>{formatINR(v.price)}</td>
                        <td>
                          <span style={{ color: v.quantity === 0 ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>
                            {v.quantity}
                          </span>
                        </td>
                        <td>
                          {restockId === v.id ? (
                            <div className="restock-inline">
                              <input
                                type="number" min="1" placeholder="qty"
                                value={restockQty}
                                onChange={(e) => setRestockQty(e.target.value)}
                              />
                              <button className="btn btn-primary btn-sm" onClick={() => handleRestock(v.id)}>Add</button>
                              <button className="btn btn-ghost btn-sm" onClick={() => setRestockId(null)}>✕</button>
                            </div>
                          ) : (
                            <div className="table-actions">
                              <button className="btn btn-secondary btn-sm" onClick={() => startEdit(v)}>Edit</button>
                              <button className="btn btn-ghost btn-sm" onClick={() => { setRestockId(v.id); setRestockQty(''); }}>Restock</button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v.id)}>Delete</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

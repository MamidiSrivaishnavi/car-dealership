import { useEffect, useState } from 'react';
import { vehiclesAPI } from '../api';

const emptyForm = { make: '', model: '', category: '', price: '', quantity: '' };

export default function AdminPage() {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [restockId, setRestockId] = useState(null);
  const [restockQty, setRestockQty] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    const res = await vehiclesAPI.list();
    setVehicles(res.data.vehicles);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setMessage('');
    const data = { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) };
    try {
      if (editId) {
        await vehiclesAPI.update(editId, data);
        setMessage('Vehicle updated');
      } else {
        await vehiclesAPI.create(data);
        setMessage('Vehicle created');
      }
      setForm(emptyForm); setEditId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    }
  }

  async function handleDelete(id) {
    setError(''); setMessage('');
    try {
      await vehiclesAPI.remove(id);
      setMessage('Vehicle deleted');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed');
    }
  }

  async function handleRestock(id) {
    setError(''); setMessage('');
    try {
      await vehiclesAPI.restock(id, parseInt(restockQty));
      setMessage('Vehicle restocked');
      setRestockId(null); setRestockQty('');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Restock failed');
    }
  }

  function startEdit(v) {
    setEditId(v.id);
    setForm({ make: v.make, model: v.model, category: v.category, price: v.price, quantity: v.quantity });
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <h2>{editId ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
      <form onSubmit={handleSubmit}>
        {['make', 'model', 'category'].map((f) => (
          <input key={f} placeholder={f} value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} required />
        ))}
        <input placeholder="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        <input placeholder="quantity" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
        <button type="submit">{editId ? 'Update' : 'Create'}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm(emptyForm); }}>Cancel</button>}
      </form>

      <h2>All Vehicles</h2>
      <ul>
        {vehicles.map((v) => (
          <li key={v.id}>
            {v.make} {v.model} — {v.category} — ${v.price} — Stock: {v.quantity}
            <button onClick={() => startEdit(v)}>Edit</button>
            <button onClick={() => handleDelete(v.id)}>Delete</button>
            <button onClick={() => { setRestockId(v.id); setRestockQty(''); }}>Restock</button>
            {restockId === v.id && (
              <span>
                <input type="number" placeholder="qty" value={restockQty} onChange={(e) => setRestockQty(e.target.value)} />
                <button onClick={() => handleRestock(v.id)}>Confirm</button>
                <button onClick={() => setRestockId(null)}>Cancel</button>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

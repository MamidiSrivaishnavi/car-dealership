import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vehiclesAPI } from '../api';

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
    setLoading(true);
    setError('');
    try {
      const res = await vehiclesAPI.list();
      setVehicles(res.data.vehicles);
    } catch {
      setError('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
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
      setMessage('Restocked successfully');
      setRestockId(null); setRestockQty('');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Restock failed');
    }
  }

  function startEdit(v) {
    setEditId(v.id);
    setForm({ make: v.make, model: v.model, category: v.category, price: String(v.price), quantity: String(v.quantity) });
    setMessage('');
  }

  function cancelEdit() {
    setEditId(null);
    setForm(emptyForm);
  }

  function field(key) {
    return (e) => setForm({ ...form, [key]: e.target.value });
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      <p><Link to="/dashboard">← Dashboard</Link> &nbsp; <button onClick={logout}>Logout</button></p>

      {error   && <p style={{ color: 'red'   }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <h2>{editId ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Make"     value={form.make}     onChange={field('make')}     required />
        <input placeholder="Model"    value={form.model}    onChange={field('model')}    required />
        <input placeholder="Category" value={form.category} onChange={field('category')} required />
        <input placeholder="Price"    value={form.price}    onChange={field('price')}    required type="number" min="0" step="0.01" />
        <input placeholder="Quantity" value={form.quantity} onChange={field('quantity')} required type="number" min="0" />
        <button type="submit">{editId ? 'Update' : 'Create'}</button>
        {editId && <button type="button" onClick={cancelEdit}>Cancel</button>}
      </form>

      <h2>All Vehicles {loading ? '(loading…)' : `(${vehicles.length})`}</h2>
      {!loading && vehicles.length === 0 && <p>No vehicles.</p>}
      {vehicles.length > 0 && (
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>Make</th><th>Model</th><th>Category</th>
              <th>Price</th><th>Stock</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td>{v.make}</td>
                <td>{v.model}</td>
                <td>{v.category}</td>
                <td>${v.price}</td>
                <td>{v.quantity}</td>
                <td>
                  <button onClick={() => startEdit(v)}>Edit</button>{' '}
                  <button onClick={() => handleDelete(v.id)}>Delete</button>{' '}
                  {restockId === v.id ? (
                    <>
                      <input
                        type="number" min="1" placeholder="qty"
                        value={restockQty}
                        onChange={(e) => setRestockQty(e.target.value)}
                        style={{ width: 60 }}
                      />
                      <button onClick={() => handleRestock(v.id)}>Confirm</button>{' '}
                      <button onClick={() => setRestockId(null)}>Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => { setRestockId(v.id); setRestockQty(''); }}>Restock</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

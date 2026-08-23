import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vehiclesAPI } from '../api';

const emptySearch = { make: '', model: '', category: '', minPrice: '', maxPrice: '' };

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState(emptySearch);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadVehicles() {
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

  useEffect(() => { loadVehicles(); }, []);

  async function handleSearch(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const params = {};
      if (search.make) params.make = search.make;
      if (search.model) params.model = search.model;
      if (search.category) params.category = search.category;
      if (search.minPrice) params.minPrice = search.minPrice;
      if (search.maxPrice) params.maxPrice = search.maxPrice;
      const res = await vehiclesAPI.search(params);
      setVehicles(res.data.vehicles);
    } catch {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setSearch(emptySearch);
    loadVehicles();
  }

  async function handlePurchase(id) {
    setMessage('');
    setError('');
    try {
      await vehiclesAPI.purchase(id);
      setMessage('Vehicle purchased successfully');
      loadVehicles();
    } catch (err) {
      setError(err.response?.data?.error || 'Purchase failed');
    }
  }

  function set(field) {
    return (e) => setSearch({ ...search, [field]: e.target.value });
  }

  return (
    <div>
      <h1>Vehicle Dashboard</h1>
      <p>Role: <strong>{user?.role}</strong> &nbsp;
        <button onClick={logout}>Logout</button>
        {user?.role === 'ADMIN' && <> &nbsp; <Link to="/admin">Admin Panel</Link></>}
      </p>

      <h2>Search / Filter</h2>
      <form onSubmit={handleSearch}>
        <input placeholder="Make"     value={search.make}     onChange={set('make')} />
        <input placeholder="Model"    value={search.model}    onChange={set('model')} />
        <input placeholder="Category" value={search.category} onChange={set('category')} />
        <input placeholder="Min Price" type="number" value={search.minPrice} onChange={set('minPrice')} />
        <input placeholder="Max Price" type="number" value={search.maxPrice} onChange={set('maxPrice')} />
        <button type="submit" disabled={loading}>Search</button>
        <button type="button" onClick={handleReset} disabled={loading}>Reset</button>
      </form>

      {error   && <p style={{ color: 'red'   }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <h2>Vehicles {loading ? '(loading…)' : `(${vehicles.length})`}</h2>
      {!loading && vehicles.length === 0 && <p>No vehicles found.</p>}
      {vehicles.length > 0 && (
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>Make</th><th>Model</th><th>Category</th>
              <th>Price</th><th>Stock</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td>{v.make}</td>
                <td>{v.model}</td>
                <td>{v.category}</td>
                <td>${v.price}</td>
                <td>{v.quantity === 0 ? 'Out of stock' : v.quantity}</td>
                <td>
                  {v.quantity > 0
                    ? <button onClick={() => handlePurchase(v.id)}>Purchase</button>
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

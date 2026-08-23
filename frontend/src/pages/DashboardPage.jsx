import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vehiclesAPI } from '../api';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState({ make: '', category: '', minPrice: '', maxPrice: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadVehicles() {
    try {
      const res = await vehiclesAPI.list();
      setVehicles(res.data.vehicles);
    } catch {
      setError('Failed to load vehicles');
    }
  }

  useEffect(() => { loadVehicles(); }, []);

  async function handleSearch(e) {
    e.preventDefault();
    setError('');
    try {
      const params = {};
      if (search.make) params.make = search.make;
      if (search.category) params.category = search.category;
      if (search.minPrice) params.minPrice = search.minPrice;
      if (search.maxPrice) params.maxPrice = search.maxPrice;
      const res = await vehiclesAPI.search(params);
      setVehicles(res.data.vehicles);
    } catch {
      setError('Search failed');
    }
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

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Logged in as: {user?.role}</p>
      <button onClick={logout}>Logout</button>
      {user?.role === 'ADMIN' && <Link to="/admin"> | Admin Panel</Link>}

      <h2>Search Vehicles</h2>
      <form onSubmit={handleSearch}>
        <input placeholder="Make" value={search.make} onChange={(e) => setSearch({ ...search, make: e.target.value })} />
        <input placeholder="Category" value={search.category} onChange={(e) => setSearch({ ...search, category: e.target.value })} />
        <input placeholder="Min Price" type="number" value={search.minPrice} onChange={(e) => setSearch({ ...search, minPrice: e.target.value })} />
        <input placeholder="Max Price" type="number" value={search.maxPrice} onChange={(e) => setSearch({ ...search, maxPrice: e.target.value })} />
        <button type="submit">Search</button>
        <button type="button" onClick={loadVehicles}>Reset</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <h2>Vehicles ({vehicles.length})</h2>
      {vehicles.length === 0 ? (
        <p>No vehicles found.</p>
      ) : (
        <ul>
          {vehicles.map((v) => (
            <li key={v.id}>
              {v.make} {v.model} — {v.category} — ${v.price} — Stock: {v.quantity}
              {v.quantity > 0 && (
                <button onClick={() => handlePurchase(v.id)}>Purchase</button>
              )}
              {v.quantity === 0 && <span> (Out of stock)</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

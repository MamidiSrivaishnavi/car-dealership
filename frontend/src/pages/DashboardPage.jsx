import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vehiclesAPI } from '../api';
import { formatINR } from '../utils/currency';

const emptySearch = { make: '', model: '', category: '', minPrice: '', maxPrice: '' };

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState(emptySearch);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadVehicles() {
    setLoading(true); setError('');
    try {
      const res = await vehiclesAPI.list();
      setVehicles(res.data.vehicles);
    } catch { setError('Failed to load vehicles'); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadVehicles(); }, []);

  async function handleSearch(e) {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const params = {};
      if (search.make)     params.make     = search.make;
      if (search.model)    params.model    = search.model;
      if (search.category) params.category = search.category;
      if (search.minPrice) params.minPrice = search.minPrice;
      if (search.maxPrice) params.maxPrice = search.maxPrice;
      const res = await vehiclesAPI.search(params);
      setVehicles(res.data.vehicles);
    } catch { setError('Search failed'); }
    finally { setLoading(false); }
  }

  function handleReset() { setSearch(emptySearch); loadVehicles(); }

  async function handlePurchase(id) {
    setMessage(''); setError('');
    try {
      await vehiclesAPI.purchase(id);
      setMessage('Purchase successful — enjoy your new vehicle!');
      loadVehicles();
    } catch (err) { setError(err.response?.data?.error || 'Purchase failed'); }
  }

  const set = (f) => (e) => setSearch({ ...search, [f]: e.target.value });

  return (
    <>
      <nav className="nav">
        <span className="nav-logo">⬡ AutoElite</span>
        <div className="nav-right">
          <span className={`nav-role${user?.role === 'ADMIN' ? ' admin' : ''}`}>{user?.role}</span>
          <Link to="/purchases" className="btn btn-secondary btn-sm">My Purchases</Link>
          {user?.role === 'ADMIN' && <Link to="/admin" className="btn btn-secondary btn-sm">Admin Panel</Link>}
          <button onClick={logout} className="btn btn-ghost btn-sm">Sign Out</button>
        </div>
      </nav>

      <div className="page">
        <div className="page-header">
          <h1>Vehicle Inventory</h1>
          <p>Browse and purchase from our premium selection</p>
        </div>

        <div className="search-panel">
          <h3>Search &amp; Filter</h3>
          <form onSubmit={handleSearch}>
            <div className="search-grid">
              <div className="form-group" style={{ margin: 0 }}>
                <label>Make</label>
                <input placeholder="e.g. Toyota" value={search.make} onChange={set('make')} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Model</label>
                <input placeholder="e.g. Camry" value={search.model} onChange={set('model')} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Category</label>
                <input placeholder="e.g. SUV" value={search.category} onChange={set('category')} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Min Price (₹)</label>
                <input type="number" placeholder="0" value={search.minPrice} onChange={set('minPrice')} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Max Price (₹)</label>
                <input type="number" placeholder="Any" value={search.maxPrice} onChange={set('maxPrice')} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>&nbsp;</label>
                <div className="search-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>Search</button>
                  <button type="button" className="btn btn-ghost" onClick={handleReset} disabled={loading}>Reset</button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {error   && <div className="alert alert-error">⚠ {error}</div>}
        {message && <div className="alert alert-success">✓ {message}</div>}

        {loading ? (
          <div className="loading-row"><span className="spinner" /> Loading vehicles…</div>
        ) : vehicles.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🚗</div>
            <h3>No vehicles found</h3>
            <p>Try adjusting your search filters</p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)', fontSize: '.88rem', marginBottom: '1rem' }}>
              Showing <strong style={{ color: 'var(--text)' }}>{vehicles.length}</strong> vehicle{vehicles.length !== 1 ? 's' : ''}
            </p>
            <div className="vehicles-grid">
              {vehicles.map((v) => (
                <div key={v.id} className="vehicle-card">
                  <div className="vehicle-card-header">
                    <div className="vehicle-make-model">
                      <h3>{v.make} {v.model}</h3>
                      <span>{v.make}</span>
                    </div>
                    <span className="vehicle-category">{v.category}</span>
                  </div>
                  <div className="vehicle-price">{formatINR(v.price)}</div>
                  <div className="vehicle-stock">
                    <span className={`stock-dot ${v.quantity > 0 ? 'in' : 'out'}`} />
                    <span className={`stock-label ${v.quantity === 0 ? 'out' : ''}`}>
                      {v.quantity > 0 ? `${v.quantity} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  <div className="vehicle-card-footer">
                    {v.quantity > 0
                      ? <button className="btn btn-primary btn-full" onClick={() => handlePurchase(v.id)}>Purchase</button>
                      : <button className="btn btn-ghost btn-full" disabled>Unavailable</button>
                    }
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

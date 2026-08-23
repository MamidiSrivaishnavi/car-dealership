import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vehiclesAPI } from '../api';
import { formatINR } from '../utils/currency';

export default function PurchasesPage() {
  const { user, logout } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    vehiclesAPI.myPurchases()
      .then((res) => setPurchases(res.data.purchases))
      .catch(() => setError('Failed to load purchase history'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <nav className="nav">
        <span className="nav-logo">⬡ AutoElite</span>
        <div className="nav-right">
          <span className={`nav-role${user?.role === 'ADMIN' ? ' admin' : ''}`}>{user?.role}</span>
          <Link to="/dashboard" className="btn btn-secondary btn-sm">Inventory</Link>
          {user?.role === 'ADMIN' && <Link to="/admin" className="btn btn-secondary btn-sm">Admin Panel</Link>}
          <button onClick={logout} className="btn btn-ghost btn-sm">Sign Out</button>
        </div>
      </nav>

      <div className="page">
        <div className="page-header">
          <h1>My Purchases</h1>
          <p>Your complete vehicle purchase history</p>
        </div>

        {error && <div className="alert alert-error">⚠ {error}</div>}

        {loading ? (
          <div className="loading-row"><span className="spinner" /> Loading…</div>
        ) : purchases.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🧾</div>
            <h3>No purchases yet</h3>
            <p>Head to the <Link to="/dashboard">inventory</Link> to find your next vehicle</p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)', fontSize: '.88rem', marginBottom: '1rem' }}>
              <strong style={{ color: 'var(--text)' }}>{purchases.length}</strong> purchase{purchases.length !== 1 ? 's' : ''}
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Vehicle</th>
                    <th>Category</th>
                    <th>Price Paid</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((p, i) => (
                    <tr key={p.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{purchases.length - i}</td>
                      <td><strong>{p.vehicle.make} {p.vehicle.model}</strong></td>
                      <td><span className="vehicle-category">{p.vehicle.category}</span></td>
                      <td style={{ color: 'var(--accent)', fontWeight: 600 }}>{formatINR(p.price)}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>
                        {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}

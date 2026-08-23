import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vehiclesAPI } from '../api';
import { formatINR } from '../utils/currency';

const BENEFITS = [
  { icon: '◈', title: 'Premium Vehicle Selection', desc: 'Curated inventory of luxury and performance vehicles from the world\'s top manufacturers.' },
  { icon: '◉', title: 'Trusted & Secure', desc: 'Every transaction is protected. Our verified process ensures a safe, transparent purchase.' },
  { icon: '◎', title: 'Easy Purchasing', desc: 'Browse, select, and purchase your vehicle in minutes — no lengthy paperwork or delays.' },
  { icon: '◇', title: 'Reliable Service', desc: 'Dedicated support from our automotive experts before, during, and after your purchase.' },
];

export default function HomePage() {
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  useEffect(() => {
    vehiclesAPI.list()
      .then(res => setVehicles((res.data.vehicles || res.data).slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoadingVehicles(false));
  }, []);

  return (
    <div className="public-page">
      {/* ── Navbar ── */}
      <nav className="public-nav">
        <div className="public-nav-inner">
          <span className="nav-logo">⬡ AutoElite</span>
          <div className="public-nav-links">
            <Link to="/" className="public-nav-link active">Home</Link>
            <Link to="/about" className="public-nav-link">About Us</Link>
          </div>
          <div className="public-nav-actions">
            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Create Account</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-eyebrow">Premium Automotive Experience</div>
          <h1 className="hero-headline">Drive Your Dream<br />Vehicle</h1>
          <p className="hero-desc">
            Discover an exclusive collection of luxury and performance vehicles.
            AutoElite connects you with the finest cars on the market — seamlessly and securely.
          </p>
          <div className="hero-ctas">
            <Link to="/login" className="btn btn-primary hero-cta-primary">Browse Vehicles</Link>
            <Link to="/about" className="btn btn-secondary hero-cta-secondary">Learn About Us</Link>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-car-graphic">
            <div className="car-glow" />
            <div className="car-icon">🏎</div>
          </div>
        </div>
      </section>

      {/* ── Why Choose AutoElite ── */}
      <section className="benefits-section">
        <div className="section-inner">
          <div className="section-label">Why Choose AutoElite?</div>
          <h2 className="section-title">The Premium Standard in<br />Vehicle Dealership</h2>
          <div className="benefits-grid">
            {BENEFITS.map(b => (
              <div key={b.title} className="benefit-card">
                <div className="benefit-icon">{b.icon}</div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Vehicles ── */}
      <section className="featured-section">
        <div className="section-inner">
          <div className="section-label">Featured Inventory</div>
          <h2 className="section-title">Explore Our Vehicles</h2>
          {loadingVehicles ? (
            <div className="loading-row"><div className="spinner" />Loading vehicles…</div>
          ) : vehicles.length > 0 ? (
            <div className="vehicles-grid">
              {vehicles.map(v => (
                <div key={v.id} className="vehicle-card">
                  <div className="vehicle-card-header">
                    <div className="vehicle-make-model">
                      <h3>{v.make} {v.model}</h3>
                      <span>{v.year}</span>
                    </div>
                    <span className="vehicle-category">{v.category}</span>
                  </div>
                  <div className="vehicle-price">{formatINR(v.price)}</div>
                  <div className="vehicle-stock">
                    <span className={`stock-dot ${v.stock > 0 ? 'in' : 'out'}`} />
                    <span className={`stock-label ${v.stock > 0 ? '' : 'out'}`}>
                      {v.stock > 0 ? `${v.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  <div className="vehicle-card-footer">
                    <Link to="/login" className="btn btn-secondary btn-sm btn-full">View Details</Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="icon">🚗</div>
              <h3>Inventory loading soon</h3>
              <p>Sign in to browse our full vehicle collection.</p>
            </div>
          )}
          <div className="featured-cta">
            <Link to="/login" className="btn btn-primary">Browse Full Inventory</Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="public-footer">
        <div className="public-footer-inner">
          <span className="nav-logo">⬡ AutoElite</span>
          <p>© {new Date().getFullYear()} AutoElite. Premium vehicles, exceptional service.</p>
        </div>
      </footer>
    </div>
  );
}

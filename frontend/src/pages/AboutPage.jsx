import { Link } from 'react-router-dom';

const OFFERS = [
  { icon: '◈', title: 'Luxury Vehicles', desc: 'An exclusive selection of premium sedans, SUVs, and sports cars from the world\'s leading brands.' },
  { icon: '◉', title: 'Verified Inventory', desc: 'Every vehicle in our system is verified and accurately listed with real-time stock availability.' },
  { icon: '◎', title: 'Seamless Transactions', desc: 'Our platform makes purchasing straightforward — browse, buy, and track your order with ease.' },
  { icon: '◇', title: 'Expert Support', desc: 'Our team of automotive specialists is available to guide you to the perfect vehicle.' },
];

const REASONS = [
  { stat: '500+', label: 'Vehicles Available' },
  { stat: '10K+', label: 'Happy Customers' },
  { stat: '15+', label: 'Years of Excellence' },
  { stat: '100%', label: 'Secure Transactions' },
];

export default function AboutPage() {
  return (
    <div className="public-page">
      {/* ── Navbar ── */}
      <nav className="public-nav">
        <div className="public-nav-inner">
          <span className="nav-logo">⬡ AutoElite</span>
          <div className="public-nav-links">
            <Link to="/" className="public-nav-link">Home</Link>
            <Link to="/about" className="public-nav-link active">About Us</Link>
          </div>
          <div className="public-nav-actions">
            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Create Account</Link>
          </div>
        </div>
      </nav>

      {/* ── About Hero ── */}
      <section className="about-hero">
        <div className="about-hero-content">
          <div className="hero-eyebrow">Our Story</div>
          <h1>About AutoElite</h1>
          <p>
            AutoElite is a modern premium vehicle dealership built on the belief that buying a car
            should be as exceptional as the vehicle itself. We combine cutting-edge technology with
            deep automotive expertise to deliver an unmatched experience.
          </p>
        </div>
      </section>

      {/* ── Who We Are ── */}
      <section className="about-section">
        <div className="section-inner about-who">
          <div className="about-who-text">
            <div className="section-label">Who We Are</div>
            <h2 className="section-title">A New Standard in<br />Premium Dealership</h2>
            <p className="about-body">
              Founded with a passion for exceptional vehicles, AutoElite has grown into a trusted
              destination for discerning buyers. We curate only the finest inventory — from sleek
              luxury sedans to powerful performance SUVs — ensuring every vehicle meets our
              rigorous quality standards.
            </p>
            <p className="about-body">
              Our platform is designed for the modern buyer: transparent pricing, real-time
              inventory, and a purchasing process that respects your time. No hidden fees,
              no pressure — just the right vehicle at the right price.
            </p>
          </div>
          <div className="about-stats-grid">
            {REASONS.map(r => (
              <div key={r.label} className="about-stat-card">
                <div className="about-stat-number">{r.stat}</div>
                <div className="about-stat-label">{r.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What We Offer ── */}
      <section className="benefits-section">
        <div className="section-inner">
          <div className="section-label">What We Offer</div>
          <h2 className="section-title">Everything You Need,<br />Nothing You Don't</h2>
          <div className="benefits-grid">
            {OFFERS.map(o => (
              <div key={o.title} className="benefit-card">
                <div className="benefit-icon">{o.icon}</div>
                <h3>{o.title}</h3>
                <p>{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="about-section about-why">
        <div className="section-inner">
          <div className="section-label">Why Choose Us?</div>
          <h2 className="section-title">The AutoElite Difference</h2>
          <div className="why-grid">
            <div className="why-item">
              <span className="why-check">✦</span>
              <div>
                <strong>Real-time inventory</strong>
                <p>Stock levels update instantly so you always see what's actually available.</p>
              </div>
            </div>
            <div className="why-item">
              <span className="why-check">✦</span>
              <div>
                <strong>Transparent pricing</strong>
                <p>No hidden fees. The price you see is the price you pay.</p>
              </div>
            </div>
            <div className="why-item">
              <span className="why-check">✦</span>
              <div>
                <strong>Secure platform</strong>
                <p>Industry-standard security protects every account and transaction.</p>
              </div>
            </div>
            <div className="why-item">
              <span className="why-check">✦</span>
              <div>
                <strong>Dedicated support</strong>
                <p>Our team is here to help you find and purchase the perfect vehicle.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta-section">
        <div className="section-inner about-cta-inner">
          <h2>Ready to Find Your Vehicle?</h2>
          <p>Browse our full inventory and drive away in your dream car today.</p>
          <div className="hero-ctas">
            <Link to="/login" className="btn btn-primary hero-cta-primary">Browse Vehicles</Link>
            <Link to="/register" className="btn btn-secondary hero-cta-secondary">Create Account</Link>
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

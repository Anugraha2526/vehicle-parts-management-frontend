import { Link } from "react-router-dom";
import "./LandingPage.css";

const FEATURES = [
  {
    title: "Inventory Control",
    desc: "Track every part across vendors in real time with automatic low-stock alerts when levels drop.",
  },
  {
    title: "Customer Records",
    desc: "Link vehicles to customers, log purchase history, and manage outstanding credit balances.",
  },
  {
    title: "Financial Insights",
    desc: "Purchase invoices, sales reports, and profit summaries all visible from one clean dashboard.",
  },
];

export default function LandingPage() {
  return (
    <div className="landing">

      {/* sticky nav — logo on left, auth buttons on right */}
      <header className="landing-nav">
        <span className="landing-nav-logo">ChitoSpare</span>
        <div className="landing-nav-actions">
          <Link to="/login" className="landing-btn landing-btn--outline">Log in</Link>
          <Link to="/signup" className="landing-btn landing-btn--primary">Sign Up</Link>
        </div>
      </header>

      {/* hero — headline left, illustration placeholder right */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <span className="landing-badge">Vehicle Parts Management · Nepal</span>
          <h1 className="landing-hero-title">
            Your Parts.<br />
            Your Records.<br />
            <span className="landing-hero-accent">Everything Simplified.</span>
          </h1>
          <p className="landing-hero-desc">
            ChitoSpare is a complete management system for vehicle parts shops.
            Track inventory, manage customers, process invoices, and monitor
            your finances from one place.
          </p>
          <div className="landing-hero-ctas">
            <Link to="/signup" className="landing-btn landing-btn--primary landing-btn--lg">
              Get Started
            </Link>
            <Link to="/login" className="landing-btn landing-btn--outline landing-btn--lg">
              Log In
            </Link>
          </div>
        </div>

        {/* hero visual, fallback C mark shown only if the image fails to load */}
        <div className="landing-hero-visual" aria-hidden="true">
          <div className="landing-hero-visual-inner">
            <div className="landing-logo-mark">C</div>
            <p className="landing-visual-label">Parts · Invoices · Customers</p>
          </div>
          <img
            src="https://st2.depositphotos.com/4035529/10466/v/450/depositphotos_104665626-stock-illustration-auto-spare-parts-seamless-pattern.jpg"
            alt="Vehicle parts"
            className="landing-hero-img"
          />
        </div>
      </section>

      {/* three feature highlight cards */}
      <section className="landing-features" aria-label="Key features">
        {FEATURES.map((f) => (
          <div key={f.title} className="landing-feature-card">
            <h3 className="landing-feature-title">{f.title}</h3>
            <p className="landing-feature-desc">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* bottom CTA band — register prompt and login fallback */}
      <section className="landing-cta">
        <h2 className="landing-cta-title">Ready to get started?</h2>
        <p className="landing-cta-sub">
          Register now and begin your ChitoSpare journey.
        </p>
        <Link to="/signup" className="landing-btn landing-btn--primary landing-btn--lg">
          Register Now
        </Link>
        <p className="landing-cta-login">
          Already have an account?{" "}
          <Link to="/login" className="landing-cta-link">Log in here</Link>
        </p>
      </section>

      <footer className="landing-footer">
        <span>© 2025 ChitoSpare</span>
      </footer>

    </div>
  );
}

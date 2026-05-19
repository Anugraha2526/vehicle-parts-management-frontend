import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { portalApi } from "../../../api/portalApi";
import "./CustomerHomePage.css";

// portal section cards — each links to a dedicated page
const PAGE_CARDS = [
  {
    to: "/portal/profile",
    title: "My Profile",
    desc: "Update your personal details and manage your registered vehicles all in one place.",
    action: "View Profile",
  },
  {
    to: "/portal/appointments",
    title: "My Appointments",
    desc: "Book a service visit and keep track of upcoming and past appointments.",
    action: "View Appointments",
  },
  {
    to: "/portal/service-history",
    title: "Service History",
    desc: "Review every invoice, see your total spending, and track loyalty savings over time.",
    action: "View History",
  },
  {
    to: "/portal/reviews",
    title: "Service Reviews",
    desc: "Rate the services you have received and help other customers make informed choices.",
    action: "Write a Review",
  },
  {
    to: "/portal/part-requests",
    title: "Request a Part",
    desc: "Can't find what you need in stock? Submit a request and we will source it for you.",
    action: "View Requests",
  },
];

export default function CustomerHomePage() {
  const { user } = useAuth();

  // show only the first name to keep the greeting concise
  const firstName = user?.fullName?.split(" ")[0] ?? "there";

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // fetch all stat sources in parallel to minimise perceived load time
  useEffect(() => {
    Promise.all([
      portalApi.getAppointments(),
      portalApi.getServiceHistory(),
      portalApi.getPartRequests(),
    ])
      .then(([apptRes, historyRes, requestsRes]) => {
        const appointments = apptRes.data?.data ?? [];
        const history = historyRes.data?.data ?? {};
        const requests = requestsRes.data?.data ?? [];

        setStats({
          appointmentCount: appointments.length,
          totalSpent: history.totalSpent ?? 0,
          totalSaved: history.totalSaved ?? 0,
          partRequestCount: requests.length,
        });
      })
      .catch(() => {
        setStats({ appointmentCount: 0, totalSpent: 0, totalSaved: 0, partRequestCount: 0 });
      })
      .finally(() => setStatsLoading(false));
  }, []);

  return (
    <div className="ch-page">

      {/* hero with personalised greeting and brief platform description */}
      <section className="ch-hero">
        <span className="ch-badge">Customer Portal</span>
        <h1 className="ch-hero-title">
          Welcome back,{" "}
          <span className="ch-hero-accent">{firstName}</span>
        </h1>
        <p className="ch-hero-desc">
          This is your ChitoSpare customer portal. Book service appointments, track your
          invoices, request unavailable parts, and manage your vehicles — all from one place.
        </p>
      </section>

      {/* four stat cards pulled from live data */}
      <section aria-label="Your activity summary">
        <div className="portal-stat-grid">
          <div className="portal-stat-card">
            <p className="portal-stat-label">Appointments Booked</p>
            <p className="portal-stat-value">
              {statsLoading ? "..." : stats.appointmentCount}
            </p>
            <p className="portal-stat-meta">All time</p>
          </div>

          <div className="portal-stat-card">
            <p className="portal-stat-label">Total Spent</p>
            <p className="portal-stat-value">
              {statsLoading ? "..." : `NPR ${Number(stats.totalSpent).toLocaleString()}`}
            </p>
            <p className="portal-stat-meta">Paid invoices only</p>
          </div>

          <div className="portal-stat-card">
            <p className="portal-stat-label">Loyalty Savings</p>
            <p className="portal-stat-value">
              {statsLoading ? "..." : `NPR ${Number(stats.totalSaved).toLocaleString()}`}
            </p>
            <p className="portal-stat-meta">Total discounts applied</p>
          </div>

          <div className="portal-stat-card">
            <p className="portal-stat-label">Part Requests</p>
            <p className="portal-stat-value">
              {statsLoading ? "..." : stats.partRequestCount}
            </p>
            <p className="portal-stat-meta">Total submitted</p>
          </div>
        </div>
      </section>

      {/* portal section cards — one per page with a direct navigation link */}
      <section aria-label="Portal sections">
        <div className="ch-cards">
          {PAGE_CARDS.map((card) => (
            <div key={card.to} className="ch-card">
              <div className="ch-card-header">
                <h3 className="ch-card-title">{card.title}</h3>
              </div>
              <div className="ch-card-body">
                <p className="ch-card-desc">{card.desc}</p>
                <Link to={card.to} className="ch-card-btn">
                  {card.action}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

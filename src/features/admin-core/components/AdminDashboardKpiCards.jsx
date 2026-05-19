import { formatCurrency } from "../../../utils/formatCurrency";

function formatCount(value) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

function valueLabel(type, value) {
  if (type === "currency") {
    return formatCurrency(value, "NPR", "en-NP");
  }

  return formatCount(value);
}

export default function AdminDashboardKpiCards({ cards, isLoading }) {
  if (isLoading) {
    return (
      <section className="admin-kpi-grid" aria-label="Loading dashboard metrics">
        {Array.from({ length: 4 }).map((_, index) => (
          <article key={`skeleton-${index}`} className="admin-kpi-card admin-kpi-card--skeleton">
            <div className="admin-skeleton admin-skeleton-label" />
            <div className="admin-skeleton admin-skeleton-value" />
            <div className="admin-skeleton admin-skeleton-meta" />
          </article>
        ))}
      </section>
    );
  }

  return (
    <section className="admin-kpi-grid" aria-label="Dashboard metrics">
      {cards.map((card) => (
        <article key={card.id} className="admin-kpi-card">
          <p className="admin-kpi-label">{card.label}</p>
          <p
            className={`admin-kpi-value${
              card.tone === "positive"
                ? " is-positive"
                : card.tone === "negative"
                  ? " is-negative"
                  : ""
            }`}
          >
            {valueLabel(card.type, card.value)}
          </p>
          <p className="admin-kpi-meta">{card.meta}</p>
        </article>
      ))}
    </section>
  );
}


import { formatCurrency } from "../../../utils/formatCurrency";

function TopList({ title, subtitle, items }) {
  return (
    <article className="report-top-parts-col">
      <h4 className="report-top-parts-title">{title}</h4>
      <p className="report-top-parts-subtitle">{subtitle}</p>

      {items.length === 0 ? (
        <p className="cs-muted">No data for this period.</p>
      ) : (
        <ol className="report-top-list">
          {items.map((item) => (
            <li key={`${title}-${item.partId}`} className="report-top-row">
              <div>
                <strong className="report-top-name">{item.partName}</strong>
                <p className="report-top-meta">
                  Qty: {item.quantity}
                </p>
              </div>
              <strong className="report-top-amount">
                {formatCurrency(item.amount, "NPR", "en-NP")}
              </strong>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}

export default function ReportTopPartsPanel({ report }) {
  if (!report) {
    return null;
  }

  const purchaseItems = report.topPurchaseParts ?? [];
  const salesItems = report.topSalesParts ?? [];

  return (
    <section className="cs-card report-top-parts-card">
      <div className="card-heading report-top-parts-head">
        <div>
          <h3 className="report-top-parts-main-title">Top Parts Performance</h3>
          <p className="report-top-parts-main-subtitle">
            High-value parts to support purchasing and sales planning decisions.
          </p>
        </div>
      </div>

      <div className="report-top-parts-grid">
        <TopList
          title="Top Purchase Spend"
          subtitle="Parts where purchasing cost was highest."
          items={purchaseItems}
        />
        <TopList
          title="Top Sales Revenue"
          subtitle="Parts generating the highest sales amount."
          items={salesItems}
        />
      </div>
    </section>
  );
}

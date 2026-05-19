import { formatCurrency } from "../../../utils/formatCurrency";

export default function ReportComparisonChart({ report }) {
  if (!report) {
    return null;
  }

  const maxValue = Math.max(report.totalPurchaseAmount, report.totalSalesAmount, 1);
  const purchaseRatio = Math.min(100, (report.totalPurchaseAmount / maxValue) * 100);
  const salesRatio = Math.min(100, (report.totalSalesAmount / maxValue) * 100);

  return (
    <section className="cs-card report-chart-card">
      <div className="card-heading report-chart-head">
        <div>
          <h3 className="report-chart-title">Purchases vs Sales</h3>
          <p className="report-chart-subtitle">
            Quick visual comparison for current report period.
          </p>
        </div>
      </div>

      <div className="report-bar-grid">
        <article className="report-bar-card">
          <div className="report-bar-track">
            <div className="report-bar report-bar--purchase" style={{ height: `${purchaseRatio}%` }} />
          </div>
          <p className="report-bar-label">Purchases</p>
          <strong className="report-bar-value">
            {formatCurrency(report.totalPurchaseAmount, "NPR", "en-NP")}
          </strong>
        </article>

        <article className="report-bar-card">
          <div className="report-bar-track">
            <div className="report-bar report-bar--sales" style={{ height: `${salesRatio}%` }} />
          </div>
          <p className="report-bar-label">Sales</p>
          <strong className="report-bar-value">
            {formatCurrency(report.totalSalesAmount, "NPR", "en-NP")}
          </strong>
        </article>
      </div>
    </section>
  );
}

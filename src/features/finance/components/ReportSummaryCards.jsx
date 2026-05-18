import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDate } from "../../../utils/formatDate";

function humanizePeriodType(periodType) {
  if (!periodType) {
    return "Financial Summary";
  }

  return `${periodType.slice(0, 1).toUpperCase()}${periodType.slice(1)} Summary`;
}

export default function ReportSummaryCards({ report }) {
  if (!report) {
    return (
      <section className="cs-card">
        <p className="cs-muted">Select a report period to view financial metrics.</p>
      </section>
    );
  }

  const periodLabel = `${formatDate(report.periodStartUtc)} - ${formatDate(report.periodEndUtc)}`;

  return (
    <section className="report-card-grid">
      <article className="cs-card metric-card">
        <p className="metric-label">{humanizePeriodType(report.periodType)}</p>
        <h3>{periodLabel}</h3>
        <p className="cs-muted">Date range based on backend-generated period.</p>
      </article>

      <article className="cs-card metric-card">
        <p className="metric-label">Purchases</p>
        <h3>{formatCurrency(report.totalPurchaseAmount, "NPR", "en-NP")}</h3>
        <p className="cs-muted">{report.purchaseInvoiceCount} invoice(s)</p>
      </article>

      <article className="cs-card metric-card">
        <p className="metric-label">Sales</p>
        <h3>{formatCurrency(report.totalSalesAmount, "NPR", "en-NP")}</h3>
        <p className="cs-muted">{report.salesInvoiceCount} invoice(s)</p>
      </article>

      <article className="cs-card metric-card">
        <p className="metric-label">Net Amount</p>
        <h3
          className={`metric-net ${
            report.netAmount >= 0 ? "metric-net--positive" : "metric-net--negative"
          }`}
        >
          {formatCurrency(report.netAmount, "NPR", "en-NP")}
        </h3>
        <p className="cs-muted">Total sales minus purchase amount.</p>
      </article>
    </section>
  );
}

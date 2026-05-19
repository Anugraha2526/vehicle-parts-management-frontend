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
      <section className="cs-card report-empty-state">
        <p className="cs-muted">Select a report period to view financial metrics.</p>
      </section>
    );
  }

  const periodStart = formatDate(report.periodStartUtc);
  const periodEnd = formatDate(report.periodEndUtc);
  const periodLabel = periodStart && periodEnd ? `${periodStart} - ${periodEnd}` : "Date range unavailable";
  const referenceDate = formatDate(report.referenceDateUtc);
  const generatedAt = formatDate(report.generatedAtUtc);

  return (
    <section className="report-card-grid">
      <article className="cs-card metric-card">
        <p className="metric-label">{humanizePeriodType(report.periodType)}</p>
        <h3 className="metric-period-range">{periodLabel}</h3>
        <p className="metric-meta">
          Reference date: {referenceDate || "n/a"} | Generated: {generatedAt || "n/a"}
        </p>
      </article>

      <article className="cs-card metric-card">
        <p className="metric-label">Purchases</p>
        <h3 className="metric-value">{formatCurrency(report.totalPurchaseAmount, "NPR", "en-NP")}</h3>
        <p className="metric-meta">{report.purchaseInvoiceCount} invoice(s)</p>
      </article>

      <article className="cs-card metric-card">
        <p className="metric-label">Sales</p>
        <h3 className="metric-value">{formatCurrency(report.totalSalesAmount, "NPR", "en-NP")}</h3>
        <p className="metric-meta">{report.salesInvoiceCount} invoice(s)</p>
      </article>

      <article className="cs-card metric-card">
        <p className="metric-label">Net Amount</p>
        <h3
          className={`metric-value metric-net ${
            report.netAmount >= 0 ? "metric-net--positive" : "metric-net--negative"
          }`}
        >
          {formatCurrency(report.netAmount, "NPR", "en-NP")}
        </h3>
        <p className="metric-meta">Total sales minus purchase amount.</p>
      </article>
    </section>
  );
}

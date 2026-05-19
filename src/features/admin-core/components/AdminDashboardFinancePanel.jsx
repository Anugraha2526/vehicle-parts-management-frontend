import { formatCurrency } from "../../../utils/formatCurrency";

const PERIOD_OPTIONS = [
  { key: "daily", label: "Daily" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

function safeReport(report) {
  return report ?? {
    totalSalesAmount: 0,
    totalPurchaseAmount: 0,
    netAmount: 0,
  };
}

export default function AdminDashboardFinancePanel({
  selectedPeriod,
  onPeriodChange,
  reportsByPeriod,
}) {
  const series = PERIOD_OPTIONS.map((period) => ({
    ...period,
    report: safeReport(reportsByPeriod[period.key]),
  }));

  const maxMagnitude = Math.max(
    1,
    ...series.map((entry) => Math.max(Math.abs(entry.report.netAmount), entry.report.totalSalesAmount))
  );

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h3>Finance Pulse</h3>
          <p>Track sales, purchases, and net movement across periods.</p>
        </div>
        <div className="admin-chip-group">
          {PERIOD_OPTIONS.map((period) => (
            <button
              key={period.key}
              type="button"
              className={`admin-chip${selectedPeriod === period.key ? " is-active" : ""}`}
              onClick={() => onPeriodChange(period.key)}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-trend-list">
        {series.map((entry) => {
          const amount = Math.max(entry.report.totalSalesAmount, Math.abs(entry.report.netAmount));
          const widthPercent = Math.max(8, Math.round((amount / maxMagnitude) * 100));

          return (
            <article key={entry.key} className="admin-trend-card">
              <div className="admin-trend-heading">
                <strong>{entry.label}</strong>
                <span>{formatCurrency(entry.report.netAmount, "NPR", "en-NP")}</span>
              </div>

              <div className="admin-trend-track" role="presentation">
                <span
                  className={`admin-trend-fill${
                    entry.report.netAmount >= 0 ? " is-positive" : " is-negative"
                  }`}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>

              <div className="admin-trend-foot">
                <span>Sales: {formatCurrency(entry.report.totalSalesAmount, "NPR", "en-NP")}</span>
                <span>
                  Purchase: {formatCurrency(entry.report.totalPurchaseAmount, "NPR", "en-NP")}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}


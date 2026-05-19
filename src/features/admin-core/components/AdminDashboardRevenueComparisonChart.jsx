import { useMemo, useState } from "react";
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
    salesInvoiceCount: 0,
    purchaseInvoiceCount: 0,
  };
}

function valueLabel(mode, value) {
  if (mode === "count") {
    return `${new Intl.NumberFormat("en-US").format(value)} invoices`;
  }

  return formatCurrency(value, "NPR", "en-NP");
}

export default function AdminDashboardRevenueComparisonChart({
  reportsByPeriod,
  selectedPeriod,
}) {
  const [mode, setMode] = useState("amount");

  const series = useMemo(
    () =>
      PERIOD_OPTIONS.map((period) => ({
        ...period,
        report: safeReport(reportsByPeriod[period.key]),
      })),
    [reportsByPeriod]
  );

  const maxValue = useMemo(() => {
    if (mode === "count") {
      return Math.max(
        1,
        ...series.flatMap((entry) => [
          entry.report.salesInvoiceCount,
          entry.report.purchaseInvoiceCount,
        ])
      );
    }

    return Math.max(
      1,
      ...series.flatMap((entry) => [entry.report.totalSalesAmount, entry.report.totalPurchaseAmount])
    );
  }, [mode, series]);

  const bars = useMemo(
    () =>
      series.map((entry) => {
        const salesValue =
          mode === "count" ? entry.report.salesInvoiceCount : entry.report.totalSalesAmount;
        const purchaseValue =
          mode === "count" ? entry.report.purchaseInvoiceCount : entry.report.totalPurchaseAmount;

        return {
          ...entry,
          salesValue,
          purchaseValue,
          salesHeight: `${Math.max(8, Math.round((salesValue / maxValue) * 100))}%`,
          purchaseHeight: `${Math.max(8, Math.round((purchaseValue / maxValue) * 100))}%`,
        };
      }),
    [maxValue, mode, series]
  );

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h3>Revenue Comparison</h3>
          <p>Compare sales and purchase volume across reporting periods.</p>
        </div>
        <div className="admin-chip-group">
          <button
            type="button"
            className={`admin-chip${mode === "amount" ? " is-active" : ""}`}
            onClick={() => setMode("amount")}
          >
            Amount
          </button>
          <button
            type="button"
            className={`admin-chip${mode === "count" ? " is-active" : ""}`}
            onClick={() => setMode("count")}
          >
            Invoices
          </button>
        </div>
      </div>

      <div className="admin-comparison-chart">
        {bars.map((entry) => (
          <article
            key={entry.key}
            className={`admin-comparison-col${
              selectedPeriod === entry.key ? " is-highlighted" : ""
            }`}
          >
            <div className="admin-comparison-bars">
              <div
                className="admin-comparison-bar is-sales"
                style={{ height: entry.salesHeight }}
                title={`Sales (${entry.label}): ${valueLabel(mode, entry.salesValue)}`}
              />
              <div
                className="admin-comparison-bar is-purchase"
                style={{ height: entry.purchaseHeight }}
                title={`Purchases (${entry.label}): ${valueLabel(mode, entry.purchaseValue)}`}
              />
            </div>
            <div className="admin-comparison-foot">
              <strong>{entry.label}</strong>
              <span>Sales: {valueLabel(mode, entry.salesValue)}</span>
              <span>Purchases: {valueLabel(mode, entry.purchaseValue)}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}


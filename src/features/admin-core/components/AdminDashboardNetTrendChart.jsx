import { useMemo } from "react";
import { formatCurrency } from "../../../utils/formatCurrency";

const PERIOD_OPTIONS = [
  { key: "daily", label: "Daily" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

function safeNet(report) {
  const value = Number(report?.netAmount);
  return Number.isFinite(value) ? value : 0;
}

function toPolylinePoints(values, width, height, padding) {
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values.map((value, index) => {
    const x = padding + (chartWidth / (values.length - 1 || 1)) * index;
    const normalized = (value - min) / range;
    const y = padding + chartHeight - normalized * chartHeight;
    return { x, y, value };
  });
}

export default function AdminDashboardNetTrendChart({ reportsByPeriod, selectedPeriod }) {
  const { points, zeroY, min, max } = useMemo(() => {
    const values = PERIOD_OPTIONS.map((period) => safeNet(reportsByPeriod[period.key]));
    const computedPoints = toPolylinePoints(values, 520, 220, 22);
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);
    const range = maximum - minimum || 1;
    const zeroNormalized = (0 - minimum) / range;
    const baseline = 22 + (220 - 44) - zeroNormalized * (220 - 44);

    return {
      points: computedPoints,
      zeroY: baseline,
      min: minimum,
      max: maximum,
    };
  }, [reportsByPeriod]);

  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h3>Net Trend</h3>
          <p>Visualize net movement direction from daily to yearly periods.</p>
        </div>
      </div>

      <div className="admin-net-chart-wrap">
        <svg viewBox="0 0 520 220" className="admin-net-chart" role="img" aria-label="Net trend chart">
          <defs>
            <linearGradient id="net-line-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#E86B2B" />
              <stop offset="100%" stopColor="#6E8E5E" />
            </linearGradient>
          </defs>

          <line
            x1="22"
            y1={Math.max(22, Math.min(198, zeroY))}
            x2="498"
            y2={Math.max(22, Math.min(198, zeroY))}
            className="admin-net-baseline"
          />

          <polyline points={polyline} className="admin-net-line" />

          {points.map((point, index) => (
            <g key={PERIOD_OPTIONS[index].key}>
              <circle
                cx={point.x}
                cy={point.y}
                r={selectedPeriod === PERIOD_OPTIONS[index].key ? 6 : 4.5}
                className={`admin-net-point${
                  selectedPeriod === PERIOD_OPTIONS[index].key ? " is-active" : ""
                }`}
              />
              <text x={point.x} y={212} textAnchor="middle" className="admin-net-axis-label">
                {PERIOD_OPTIONS[index].label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="admin-net-summary">
        <p>Lowest: {formatCurrency(min, "NPR", "en-NP")}</p>
        <p>Highest: {formatCurrency(max, "NPR", "en-NP")}</p>
      </div>
    </section>
  );
}


import { useMemo } from "react";

function clampRatio(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function classifyAlerts(alerts) {
  const buckets = {
    critical: 0,
    warning: 0,
    caution: 0,
    acknowledged: 0,
  };

  alerts.forEach((alert) => {
    if (alert.isAcknowledged) {
      buckets.acknowledged += 1;
      return;
    }

    const threshold = Math.max(1, Number(alert.threshold) || 1);
    const stock = Number(alert.currentStockQuantity) || 0;
    const ratio = clampRatio(stock / threshold);

    if (ratio <= 0.25) {
      buckets.critical += 1;
    } else if (ratio <= 0.5) {
      buckets.warning += 1;
    } else {
      buckets.caution += 1;
    }
  });

  return buckets;
}

function donutStyle(buckets) {
  const total =
    buckets.critical + buckets.warning + buckets.caution + buckets.acknowledged;

  if (total === 0) {
    return { background: "conic-gradient(#ece7de 0turn, #ece7de 1turn)" };
  }

  const criticalEnd = buckets.critical / total;
  const warningEnd = criticalEnd + buckets.warning / total;
  const cautionEnd = warningEnd + buckets.caution / total;

  return {
    background: `conic-gradient(
      #b8543c 0turn ${criticalEnd}turn,
      #c8861e ${criticalEnd}turn ${warningEnd}turn,
      #e86b2b ${warningEnd}turn ${cautionEnd}turn,
      #6e8e5e ${cautionEnd}turn 1turn
    )`,
  };
}

export default function AdminDashboardStockRiskChart({ alerts, inventoryCounts }) {
  const { buckets, totalAlerts, riskyParts } = useMemo(() => {
    const grouped = classifyAlerts(alerts);
    const total = alerts.length;
    const sortedRisk = [...alerts]
      .filter((alert) => !alert.isAcknowledged)
      .sort((left, right) => {
        const leftRatio = (left.currentStockQuantity || 0) / Math.max(1, left.threshold || 1);
        const rightRatio = (right.currentStockQuantity || 0) / Math.max(1, right.threshold || 1);
        return leftRatio - rightRatio;
      })
      .slice(0, 4);

    return {
      buckets: grouped,
      totalAlerts: total,
      riskyParts: sortedRisk,
    };
  }, [alerts]);

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h3>Stock Risk Distribution</h3>
          <p>See severity spread and the most critical parts instantly.</p>
        </div>
      </div>

      <div className="admin-risk-layout">
        <div className="admin-risk-donut-wrap">
          <div className="admin-risk-donut" style={donutStyle(buckets)} aria-hidden="true">
            <div className="admin-risk-donut-core">
              <strong>{totalAlerts}</strong>
              <span>alerts</span>
            </div>
          </div>
          <div className="admin-risk-legend">
            <p><span className="swatch critical" />Critical: {buckets.critical}</p>
            <p><span className="swatch warning" />Warning: {buckets.warning}</p>
            <p><span className="swatch caution" />Caution: {buckets.caution}</p>
            <p><span className="swatch ok" />Acknowledged: {buckets.acknowledged}</p>
          </div>
        </div>

        <div className="admin-risk-aside">
          <p className="admin-risk-inventory">
            Total parts tracked: {inventoryCounts.parts ?? 0}
          </p>
          {riskyParts.length === 0 ? (
            <p className="admin-risk-empty">No risky parts currently detected.</p>
          ) : (
            <ul className="admin-risk-list">
              {riskyParts.map((part) => (
                <li key={part.alertId}>
                  <strong>{part.partName}</strong>
                  <span>
                    Stock {part.currentStockQuantity} / {part.threshold}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}


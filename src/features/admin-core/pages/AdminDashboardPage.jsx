import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../../../components/ui/Alert";
import PageHeader from "../../../components/ui/PageHeader";
import { useAuth } from "../../../hooks/useAuth";
import AdminDashboardActivityFeed from "../components/AdminDashboardActivityFeed";
import AdminDashboardFinancePanel from "../components/AdminDashboardFinancePanel";
import AdminDashboardKpiCards from "../components/AdminDashboardKpiCards";
import AdminDashboardLowStockPanel from "../components/AdminDashboardLowStockPanel";
import AdminDashboardNetTrendChart from "../components/AdminDashboardNetTrendChart";
import AdminDashboardQuickActions from "../components/AdminDashboardQuickActions";
import AdminDashboardRevenueComparisonChart from "../components/AdminDashboardRevenueComparisonChart";
import AdminDashboardStockRiskChart from "../components/AdminDashboardStockRiskChart";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import "./AdminDashboard.css";

function formatNow() {
  return new Date().toLocaleString("en-NP", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    selectedPeriod,
    setSelectedPeriod,
    reportsByPeriod,
    activeReport,
    threshold,
    setThreshold,
    alerts,
    openAlerts,
    inventoryCounts,
    isLoading,
    isRefreshing,
    isScanning,
    acknowledgingAlertId,
    error,
    message,
    lastUpdatedAt,
    refreshDashboard,
    scanLowStockNow,
    acknowledgeAlert,
  } = useAdminDashboard();

  const kpiCards = useMemo(
    () => [
      {
        id: "purchase-amount",
        label: "Total Purchases",
        type: "currency",
        value: activeReport.totalPurchaseAmount,
        meta: `${activeReport.purchaseInvoiceCount} invoice(s) in ${selectedPeriod}`,
      },
      {
        id: "sales-amount",
        label: "Total Sales",
        type: "currency",
        value: activeReport.totalSalesAmount,
        meta: `${activeReport.salesInvoiceCount} invoice(s) in ${selectedPeriod}`,
      },
      {
        id: "net",
        label: "Net Balance",
        type: "currency",
        value: activeReport.netAmount,
        tone: activeReport.netAmount >= 0 ? "positive" : "negative",
        meta: activeReport.netAmount >= 0 ? "Healthy net movement" : "Needs follow-up",
      },
      {
        id: "alerts",
        label: "Open Low Stock Alerts",
        type: "count",
        value: openAlerts.length,
        tone: openAlerts.length > 0 ? "negative" : "positive",
        meta: `Threshold: ${threshold || "10"} | Parts: ${inventoryCounts.parts ?? 0}`,
      },
    ],
    [activeReport, inventoryCounts.parts, openAlerts.length, selectedPeriod, threshold]
  );

  return (
    <div className="admin-dashboard">
      <PageHeader
        title={`Welcome back, ${user?.fullName ?? "Admin"}`}
        subtitle={`ChitoSpare admin control center | ${formatNow()}`}
        actions={
          <button
            type="button"
            className="admin-refresh-button"
            onClick={refreshDashboard}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Refreshing..." : "Refresh Dashboard"}
          </button>
        }
      />

      {error ? <Alert variant="warning">{error}</Alert> : null}
      {message ? (
        <div className="ui-toast-layer" role="status" aria-live="polite">
          <Alert variant="success">{message}</Alert>
        </div>
      ) : null}

      <AdminDashboardKpiCards cards={kpiCards} isLoading={isLoading} />

      <div className="admin-dashboard-main-grid">
        <AdminDashboardFinancePanel
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          reportsByPeriod={reportsByPeriod}
        />

        <AdminDashboardLowStockPanel
          alerts={alerts}
          threshold={threshold}
          onThresholdChange={setThreshold}
          onScan={scanLowStockNow}
          onAcknowledge={acknowledgeAlert}
          acknowledgingAlertId={acknowledgingAlertId}
          isScanning={isScanning}
        />
      </div>

      <div className="admin-dashboard-analytics-grid">
        <AdminDashboardRevenueComparisonChart
          reportsByPeriod={reportsByPeriod}
          selectedPeriod={selectedPeriod}
        />
        <AdminDashboardNetTrendChart
          reportsByPeriod={reportsByPeriod}
          selectedPeriod={selectedPeriod}
        />
        <AdminDashboardStockRiskChart alerts={alerts} inventoryCounts={inventoryCounts} />
      </div>

      <div className="admin-dashboard-bottom-grid">
        <AdminDashboardQuickActions onNavigate={navigate} />
        <AdminDashboardActivityFeed
          selectedPeriod={selectedPeriod}
          activeReport={activeReport}
          openAlerts={openAlerts}
          inventoryCounts={inventoryCounts}
          lastUpdatedAt={lastUpdatedAt}
        />
      </div>
    </div>
  );
}

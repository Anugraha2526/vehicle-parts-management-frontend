import Alert from "../../../components/ui/Alert";
import PageHeader from "../../../components/ui/PageHeader";
import ReportComparisonChart from "../components/ReportComparisonChart";
import ReportFilter from "../components/ReportFilter";
import ReportSummaryCards from "../components/ReportSummaryCards";
import ReportTopPartsPanel from "../components/ReportTopPartsPanel";
import ReportTransactionsTable from "../components/ReportTransactionsTable";
import { useReports } from "../hooks/useReports";

export default function FinancialReportsPage() {
  const {
    reportType,
    setReportType,
    report,
    isLoading,
    error,
    message,
    refresh,
    dailyDate,
    setDailyDate,
    monthlyPeriod,
    setMonthlyPeriod,
    yearlyPeriod,
    setYearlyPeriod,
    yearOptions,
    exportCsv,
    printReport,
  } = useReports();

  return (
    <div className="finance-page finance-page--reports">
      <PageHeader
        title="Financial Reports"
        subtitle="Review daily, monthly, and yearly purchase and sales performance."
      />

      {error ? <Alert variant="error">{error}</Alert> : null}
      {message ? (
        <div className="ui-toast-layer" role="status" aria-live="polite">
          <Alert variant="success">{message}</Alert>
        </div>
      ) : null}

      <ReportFilter
        reportType={reportType}
        onTypeChange={setReportType}
        onRefresh={refresh}
        onExport={exportCsv}
        onPrint={printReport}
        isLoading={isLoading}
        dailyDate={dailyDate}
        monthlyPeriod={monthlyPeriod}
        yearlyPeriod={yearlyPeriod}
        yearOptions={yearOptions}
        onDailyDateChange={setDailyDate}
        onMonthlyPeriodChange={setMonthlyPeriod}
        onYearlyPeriodChange={setYearlyPeriod}
      />

      <ReportSummaryCards report={report} />
      <ReportComparisonChart report={report} />
      <ReportTopPartsPanel report={report} />
      <ReportTransactionsTable report={report} />
    </div>
  );
}

import Alert from "../../../components/ui/Alert";
import PageHeader from "../../../components/ui/PageHeader";
import ReportFilter from "../components/ReportFilter";
import ReportSummaryCards from "../components/ReportSummaryCards";
import { useReports } from "../hooks/useReports";

export default function FinancialReportsPage() {
  const { reportType, setReportType, report, isLoading, error, message, refresh } =
    useReports();

  return (
    <div className="finance-page">
      <PageHeader
        title="Financial Reports (Daily / Monthly / Yearly)"
        subtitle="Review purchase and sales values with backend-calculated net amount."
      />

      {error ? <Alert variant="error">{error}</Alert> : null}
      {message ? <Alert variant="info">{message}</Alert> : null}

      <ReportFilter
        reportType={reportType}
        onTypeChange={setReportType}
        onRefresh={refresh}
        isLoading={isLoading}
      />

      <ReportSummaryCards report={report} />
    </div>
  );
}

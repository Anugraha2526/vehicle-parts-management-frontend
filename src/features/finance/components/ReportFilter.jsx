import Button from "../../../components/common/Button";
import { FINANCIAL_REPORT_TYPES } from "../hooks/useReports";

function labelFromType(type) {
  return `${type.slice(0, 1).toUpperCase()}${type.slice(1)}`;
}

export default function ReportFilter({ reportType, onTypeChange, onRefresh, isLoading }) {
  return (
    <section className="cs-card report-filter">
      <div className="card-heading">
        <h3>Report Period</h3>
        <Button type="button" variant="ghost" onClick={onRefresh} disabled={isLoading}>
          Refresh
        </Button>
      </div>

      <div className="report-filter-group">
        {FINANCIAL_REPORT_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            className={`report-pill${reportType === type ? " is-active" : ""}`}
            onClick={() => onTypeChange(type)}
            disabled={isLoading}
          >
            {labelFromType(type)}
          </button>
        ))}
      </div>
    </section>
  );
}

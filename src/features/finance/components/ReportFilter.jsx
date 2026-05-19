import Button from "../../../components/common/Button";
import { FINANCIAL_REPORT_TYPES } from "../hooks/useReports";

function labelFromType(type) {
  return `${type.slice(0, 1).toUpperCase()}${type.slice(1)}`;
}

function PeriodInput({
  reportType,
  dailyDate,
  monthlyPeriod,
  yearlyPeriod,
  yearOptions,
  onDailyDateChange,
  onMonthlyPeriodChange,
  onYearlyPeriodChange,
  isLoading,
}) {
  if (reportType === "daily") {
    return (
      <label className="cs-field report-period-field">
        Day
        <input
          className="cs-input"
          type="date"
          value={dailyDate}
          onChange={(event) => onDailyDateChange(event.target.value)}
          disabled={isLoading}
        />
      </label>
    );
  }

  if (reportType === "monthly") {
    return (
      <label className="cs-field report-period-field">
        Month
        <input
          className="cs-input"
          type="month"
          value={monthlyPeriod}
          onChange={(event) => onMonthlyPeriodChange(event.target.value)}
          disabled={isLoading}
        />
      </label>
    );
  }

  return (
    <label className="cs-field report-period-field">
      Year
      <select
        className="cs-select"
        value={yearlyPeriod}
        onChange={(event) => onYearlyPeriodChange(event.target.value)}
        disabled={isLoading}
      >
        {yearOptions.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function ReportFilter({
  reportType,
  onTypeChange,
  onRefresh,
  onExport,
  onPrint,
  isLoading,
  dailyDate,
  monthlyPeriod,
  yearlyPeriod,
  yearOptions,
  onDailyDateChange,
  onMonthlyPeriodChange,
  onYearlyPeriodChange,
}) {
  return (
    <section className="cs-card report-filter">
      <div className="card-heading report-filter-head">
        <div>
          <h3 className="report-filter-title">Report Period</h3>
          <p className="report-filter-subtitle">
            Switch between daily, monthly, and yearly views and generate report data for that
            specific date window.
          </p>
        </div>
        <div className="report-actions">
          <Button type="button" variant="ghost" onClick={onPrint} disabled={isLoading}>
            Print
          </Button>
          <Button type="button" variant="ghost" onClick={onExport} disabled={isLoading}>
            Export CSV
          </Button>
          <Button type="button" variant="secondary" onClick={onRefresh} disabled={isLoading}>
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="report-filter-controls">
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

        <PeriodInput
          reportType={reportType}
          dailyDate={dailyDate}
          monthlyPeriod={monthlyPeriod}
          yearlyPeriod={yearlyPeriod}
          yearOptions={yearOptions}
          onDailyDateChange={onDailyDateChange}
          onMonthlyPeriodChange={onMonthlyPeriodChange}
          onYearlyPeriodChange={onYearlyPeriodChange}
          isLoading={isLoading}
        />
      </div>
    </section>
  );
}

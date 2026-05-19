import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "../../../utils/formatCurrency";

const PAGE_SIZE_OPTIONS = [5, 10, 20];

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("en-US");
}

function invoiceTypeVariant(entryType) {
  return entryType?.toLowerCase() === "sale" ? "success" : "warning";
}

export default function ReportTransactionsTable({ report }) {
  if (!report) {
    return null;
  }

  const transactions = report.transactions ?? [];
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, transactions.length);

  const pagedTransactions = useMemo(
    () => transactions.slice(startIndex, endIndex),
    [transactions, startIndex, endIndex]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [report.periodType, report.referenceDateUtc, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <section className="cs-card report-transactions-card">
      <div className="card-heading report-transactions-head">
        <div>
          <h3 className="report-transactions-title">Transactions Included</h3>
          <p className="report-transactions-subtitle">
            All purchase and sales invoices inside the selected reporting period.
          </p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <p className="cs-muted">No transactions found for this period.</p>
      ) : (
        <>
          <div className="cs-table-wrapper">
            <table className="cs-table report-transactions-table">
              <thead>
                <tr>
                  <th>Date/Time</th>
                  <th>Type</th>
                  <th>Invoice</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {pagedTransactions.map((transaction) => (
                  <tr key={`${transaction.entryType}-${transaction.invoiceId}`}>
                    <td>{formatDateTime(transaction.transactionDateUtc)}</td>
                    <td>
                      <span
                        className={`status-badge status-badge--${invoiceTypeVariant(
                          transaction.entryType
                        )}`}
                      >
                        {transaction.entryType}
                      </span>
                    </td>
                    <td>
                      <strong>{transaction.invoiceNumber}</strong>
                      <p className="cs-muted cs-mono report-tx-id">{transaction.invoiceId}</p>
                    </td>
                    <td className="report-tx-number">{transaction.itemCount}</td>
                    <td className="report-tx-number">
                      {formatCurrency(transaction.totalAmount, "NPR", "en-NP")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="report-transactions-footer">
            <p className="report-transactions-meta">
              Showing {startIndex + 1}-{endIndex} of {transactions.length}
            </p>

            <div className="report-transactions-controls">
              <label className="report-page-size-field">
                Rows
                <select
                  className="cs-select report-page-size-select"
                  value={pageSize}
                  onChange={(event) => setPageSize(Number(event.target.value))}
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                className="report-page-btn"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safePage === 1}
              >
                Previous
              </button>

              <span className="report-page-indicator">
                Page {safePage} / {totalPages}
              </span>

              <button
                type="button"
                className="report-page-btn"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={safePage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

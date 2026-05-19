import { formatCurrency } from "../../../utils/formatCurrency";

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
              {transactions.map((transaction) => (
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
      )}
    </section>
  );
}

import { useEffect, useState } from "react";
import Button from "../../../components/common/Button";
import { getOverdueInvoices, sendBulkReminders, sendSingleReminder, markInvoiceAsPaid } from "../../../api/salesApi";
import "./OverdueRemindersPage.css";

export default function OverdueRemindersPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remindingAll, setRemindingAll] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [notification, setNotification] = useState(null);

  function showNotification(type, message) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }

  const fetchOverdue = async () => {
    try {
      setLoading(true);
      const data = await getOverdueInvoices(1);
      setInvoices(Array.isArray(data) ? data : (data?.data ?? []));
    } catch {
      showNotification("error", "Failed to load overdue invoices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdue();
  }, []);

  const handleSendBulk = async () => {
    if (!window.confirm(`Send reminder emails to all ${invoices.length} overdue customers?`)) return;
    try {
      setRemindingAll(true);
      const response = await sendBulkReminders(1);
      showNotification("success", response?.message || "Bulk reminders sent successfully.");
    } catch {
      showNotification("error", "Failed to send reminders. Please try again.");
    } finally {
      setRemindingAll(false);
    }
  };

  const handleSendSingle = async (invoiceId) => {
    try {
      setActionLoadingId(invoiceId);
      const response = await sendSingleReminder(invoiceId);
      showNotification("success", response?.message || "Reminder sent successfully.");
    } catch {
      showNotification("error", "Failed to send reminder. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkPaid = async (invoiceId) => {
    if (!window.confirm("Mark this invoice as paid? It will be removed from this list.")) return;
    try {
      setActionLoadingId(invoiceId);
      const response = await markInvoiceAsPaid(invoiceId);
      showNotification("success", response?.message || "Invoice marked as paid.");
      setInvoices((prev) => prev.filter((inv) => inv.invoiceId !== invoiceId));
    } catch {
      showNotification("error", "Failed to mark invoice as paid. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="reminders-page">
      <div className="reminders-page-header">
        <div>
          <h1 className="reminders-page-title">Credit Reminders</h1>
          <p className="reminders-page-subtitle">
            Customers with invoices unpaid for more than 1 month
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleSendBulk}
          disabled={invoices.length === 0 || remindingAll}
          loading={remindingAll}
        >
          {remindingAll ? "Sending..." : "Send All Reminders"}
        </Button>
      </div>

      {notification && (
        <div
          className={`reminders-page-notification reminders-page-notification--${notification.type}`}
          role="status"
          aria-live="polite"
        >
          {notification.message}
        </div>
      )}

      {/* overdue count summary */}
      <div className="reminders-page-summary">
        <span className="reminders-page-summary-label">Overdue invoices</span>
        <span className="reminders-page-summary-count">{invoices.length}</span>
      </div>

      <div className="reminders-table-wrapper">
        <table className="reminders-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Invoice No.</th>
              <th>Issued On</th>
              <th className="reminders-table-amount">Amount Due</th>
              <th className="reminders-table-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: 0 }}>
                  <div className="reminders-table-empty">Loading overdue invoices...</div>
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: 0 }}>
                  <div className="reminders-table-empty">
                    <span className="reminders-table-empty-title">All clear</span>
                    <span>No overdue unpaid invoices at this time.</span>
                  </div>
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.invoiceId}>
                  <td className="reminders-table-customer">{inv.customerName}</td>
                  <td className="reminders-table-invoice">{inv.invoiceNumber}</td>
                  <td>
                    {new Date(inv.soldAtUtc).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="reminders-table-amount reminders-table-amount--value">
                    NPR {Number(inv.totalAmount).toLocaleString()}
                  </td>
                  <td className="reminders-table-actions-col">
                    <div className="reminders-table-actions">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSendSingle(inv.invoiceId)}
                        disabled={actionLoadingId === inv.invoiceId}
                      >
                        {actionLoadingId === inv.invoiceId ? "..." : "Remind"}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleMarkPaid(inv.invoiceId)}
                        disabled={actionLoadingId === inv.invoiceId}
                      >
                        Mark Paid
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

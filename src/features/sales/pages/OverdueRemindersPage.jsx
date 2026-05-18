import React, { useEffect, useState } from 'react';
import { getOverdueInvoices, sendBulkReminders, sendSingleReminder, markInvoiceAsPaid } from '../../../api/salesApi';

const OverdueRemindersPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remindingAll, setRemindingAll] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [alert, setAlert] = useState(null); // { type: 'success' | 'danger', message: string }

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchOverdue = async () => {
    try {
      setLoading(true);
      const data = await getOverdueInvoices(1);
      // API returns { data: [...], message: '...' } wrapped in ServiceResult
      setInvoices(Array.isArray(data) ? data : (data?.data ?? []));
    } catch (error) {
      showAlert('danger', 'Failed to load overdue invoices.');
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
      showAlert('success', response?.message || 'Bulk reminders sent successfully!');
    } catch (error) {
      showAlert('danger', error?.toString() || 'Failed to send reminders.');
    } finally {
      setRemindingAll(false);
    }
  };

  const handleSendSingle = async (invoiceId) => {
    try {
      setActionLoadingId(invoiceId);
      const response = await sendSingleReminder(invoiceId);
      showAlert('success', response?.message || 'Reminder sent!');
    } catch (error) {
      showAlert('danger', error?.toString() || 'Failed to send reminder.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkPaid = async (invoiceId) => {
    if (!window.confirm('Mark this invoice as Paid? It will be removed from this list.')) return;
    try {
      setActionLoadingId(invoiceId);
      const response = await markInvoiceAsPaid(invoiceId);
      showAlert('success', response?.message || 'Invoice marked as paid!');
      setInvoices(prev => prev.filter(inv => inv.invoiceId !== invoiceId));
    } catch (error) {
      showAlert('danger', error?.toString() || 'Failed to mark as paid.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Alert Banner */}
      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show mb-4`} role="alert">
          {alert.message}
          <button type="button" className="btn-close" onClick={() => setAlert(null)} />
        </div>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fs-3 fw-bold text-dark mb-1">Unpaid Credit Reminders</h2>
          <p className="text-secondary mb-0">
            Customers with invoices unpaid for more than 1 month.
            <span className="badge bg-danger ms-2">{invoices.length} overdue</span>
          </p>
        </div>
        <button
          className="btn btn-danger px-4 py-2 fw-semibold shadow-sm"
          onClick={handleSendBulk}
          disabled={invoices.length === 0 || remindingAll}
        >
          {remindingAll ? (
            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Sending...</>
          ) : (
            <>&#128231; Send All Reminders</>
          )}
        </button>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3 text-uppercase text-secondary fw-bold border-0" style={{ fontSize: '0.75rem' }}>Customer</th>
                  <th className="px-4 py-3 text-uppercase text-secondary fw-bold border-0" style={{ fontSize: '0.75rem' }}>Invoice #</th>
                  <th className="px-4 py-3 text-uppercase text-secondary fw-bold border-0 text-end" style={{ fontSize: '0.75rem' }}>Amount Due</th>
                  <th className="px-4 py-3 text-uppercase text-secondary fw-bold border-0" style={{ fontSize: '0.75rem' }}>Issued On</th>
                  <th className="px-4 py-3 text-uppercase text-secondary fw-bold border-0 text-center" style={{ fontSize: '0.75rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-secondary">
                      <div className="mb-3" style={{ fontSize: '3rem' }}>&#10003;</div>
                      <h5 className="fw-bold text-dark">All clear!</h5>
                      <p className="mb-0">No overdue unpaid invoices at this time.</p>
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.invoiceId} className="border-bottom">
                      <td className="px-4 py-3">
                        <span className="fw-semibold text-dark">{inv.customerName}</span>
                      </td>
                      <td className="px-4 py-3 text-secondary font-monospace">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3 text-end fw-bold text-danger">
                        Rs. {Number(inv.totalAmount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-secondary">
                        {new Date(inv.soldAtUtc).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="btn-group shadow-sm">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleSendSingle(inv.invoiceId)}
                            disabled={actionLoadingId === inv.invoiceId}
                            title="Send Email Reminder"
                          >
                            {actionLoadingId === inv.invoiceId
                              ? <span className="spinner-border spinner-border-sm" role="status" />
                              : <>&#128231; Remind</>
                            }
                          </button>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleMarkPaid(inv.invoiceId)}
                            disabled={actionLoadingId === inv.invoiceId}
                            title="Mark as Paid"
                          >
                            &#10003; Paid
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverdueRemindersPage;

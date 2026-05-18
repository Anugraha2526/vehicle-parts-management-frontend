import React, { useEffect, useState } from 'react';
import { getOverdueInvoices, sendBulkReminders, sendSingleReminder, markInvoiceAsPaid } from '../../../api/salesApi';

const OverdueRemindersPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remindingAll, setRemindingAll] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [alert, setAlert] = useState(null); // { type: 'success' | 'error', message: string }

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
      showAlert('error', 'Failed to load overdue invoices.');
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
      showAlert('error', error?.toString() || 'Failed to send reminders.');
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
      showAlert('error', error?.toString() || 'Failed to send reminder.');
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
      showAlert('error', error?.toString() || 'Failed to mark as paid.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--ink-500)', fontSize: '1.2rem' }}>Loading Overdue Invoices...</div>
      </div>
    );
  }

  return (
    <div className="finance-page">
      {/* Header */}
      <header className="page-header">
        <div>
          <h1 className="page-title">Pending Credits & Reminders</h1>
          <p className="page-subtitle">
            Customers with invoices unpaid for more than 1 month.
            <span className="status-badge status-badge--warning" style={{ marginLeft: '12px' }}>
              {invoices.length} Overdue
            </span>
          </p>
        </div>
        <div className="page-header-actions">
          <button
            className="cs-button cs-button--primary"
            onClick={handleSendBulk}
            disabled={invoices.length === 0 || remindingAll}
            style={{ backgroundColor: 'var(--red-600)', borderColor: 'var(--red-700)' }}
          >
            {remindingAll ? 'Sending...' : '📨 Send All Reminders'}
          </button>
        </div>
      </header>

      {/* Alert Banner */}
      {alert && (
        <div className={`cs-alert cs-alert--${alert.type}`} style={{ marginBottom: '24px' }}>
          <strong>{alert.type === 'error' ? 'Error: ' : 'Status: '}</strong>
          {alert.message}
        </div>
      )}

      {/* Table */}
      <div className="cs-card">
        <div className="card-heading">
          <h2 className="cs-field" style={{ margin: 0, fontSize: '1rem', color: 'var(--ink-900)' }}>Unpaid Invoices</h2>
        </div>
        <div className="cs-table-wrapper" style={{ marginTop: '16px' }}>
          <table className="cs-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Invoice #</th>
                <th>Issued On</th>
                <th style={{ textAlign: 'right' }}>Amount Due</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '48px', color: 'var(--ink-500)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎉</div>
                    <div style={{ fontWeight: 600, color: 'var(--ink-900)', fontSize: '1.1rem' }}>All Clear!</div>
                    <div>No overdue unpaid invoices at this time.</div>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.invoiceId}>
                    <td style={{ fontWeight: 500, color: 'var(--ink-900)' }}>{inv.customerName}</td>
                    <td className="cs-mono">{inv.invoiceNumber}</td>
                    <td>{new Date(inv.soldAtUtc).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--red-600)' }}>
                      Rs. {Number(inv.totalAmount).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          className="cs-button cs-button--ghost"
                          onClick={() => handleSendSingle(inv.invoiceId)}
                          disabled={actionLoadingId === inv.invoiceId}
                        >
                          {actionLoadingId === inv.invoiceId ? '...' : 'Remind'}
                        </button>
                        <button
                          className="cs-button cs-button--secondary"
                          onClick={() => handleMarkPaid(inv.invoiceId)}
                          disabled={actionLoadingId === inv.invoiceId}
                          style={{ borderColor: 'var(--green-500)', color: 'var(--green-600)' }}
                        >
                          ✓ Paid
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
  );
};

export default OverdueRemindersPage;

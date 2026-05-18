import { useState, useEffect } from 'react';
import CreateInvoiceModule from '../components/CreateInvoiceModule';
import { getRecentInvoices, sendInvoiceEmail } from '../../../api/salesApi';

export default function SalesDashboardPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const res = await getRecentInvoices();
      if (res && res.data) {
        setInvoices(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async (invoiceId) => {
    try {
      setLastResponse({ message: 'Sending email...', type: 'info' });
      const res = await sendInvoiceEmail(invoiceId);
      setLastResponse({ message: res.message || 'Email sent successfully!', type: 'success' });
    } catch (e) {
      setLastResponse({ message: e || 'Failed to send email.', type: 'error' });
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleSuccess = (response) => {
    setLastResponse(response);
    setIsCreating(false);
    fetchInvoices(); // Refresh list automatically
  };

  return (
    <div className="finance-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Sales & Invoices</h1>
          <p className="page-subtitle">Manage customer orders, process sales, and generate invoices.</p>
        </div>
        <div className="page-header-actions">
          {!isCreating && (
            <button className="cs-button cs-button--primary" onClick={() => setIsCreating(true)}>
              + New invoice
            </button>
          )}
        </div>
      </header>

      {lastResponse && !isCreating && (
        <div className={`cs-alert cs-alert--${lastResponse.type || 'info'}`}>
          <strong>{lastResponse.type === 'error' ? 'Error:' : 'Status:'}</strong> {lastResponse.message}
          {lastResponse.data && (
            <div style={{ marginTop: '8px' }}>
              <span className="status-badge status-badge--success">
                Invoice {lastResponse.data.invoiceNumber}
              </span>
            </div>
          )}
        </div>
      )}

      {isCreating ? (
        <CreateInvoiceModule 
          onSuccess={handleSuccess} 
          onCancel={() => setIsCreating(false)} 
        />
      ) : (
        <div className="cs-card">
          <div className="card-heading">
            <h2 className="cs-field" style={{ margin: 0, fontSize: '1rem', color: 'var(--ink-900)' }}>Recent Invoices</h2>
            <button className="cs-button cs-button--ghost">Export</button>
          </div>
          
          <div className="cs-table-wrapper" style={{ marginTop: '16px' }}>
            <table className="cs-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                   <tr>
                     <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--ink-500)' }}>
                       Loading...
                     </td>
                   </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--ink-500)' }}>
                      No recent invoices. Click "+ New invoice" to get started.
                    </td>
                  </tr>
                ) : (
                  invoices.map(inv => (
                    <tr key={inv.invoiceId}>
                      <td className="cs-mono" style={{fontWeight: 600}}>{inv.invoiceNumber}</td>
                      <td>{new Date(inv.soldAtUtc).toLocaleDateString()}</td>
                      <td>{inv.customerName}</td>
                      <td>
                        <span className="status-badge status-badge--success">Paid</span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>Rs. {inv.totalAmount.toFixed(2)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          className="cs-button cs-button--ghost" 
                          style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                          onClick={() => handleSendEmail(inv.invoiceId)}
                        >
                          Email
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import CreateInvoiceModule from '../components/CreateInvoiceModule';
import InvoiceDetailModal from '../components/InvoiceDetailModal';
import { getRecentInvoices, sendInvoiceEmail, markInvoiceAsPaid, markInvoiceAsUnpaid } from '../../../api/salesApi';
import Table from '../../../components/common/Table';
import Button from '../../../components/common/Button';
import '../../admin-core/pages/VendorPage.css';

export default function SalesDashboardPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

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

  const handleMarkAsPaid = async (invoiceId) => {
    try {
      setLastResponse({ message: 'Marking as paid...', type: 'info' });
      const res = await markInvoiceAsPaid(invoiceId);
      setLastResponse({ message: res.message || 'Invoice marked as paid!', type: 'success' });
      fetchInvoices();
    } catch (e) {
      setLastResponse({ message: e || 'Failed to mark as paid.', type: 'error' });
    }
  };

  const handleMarkAsUnpaid = async (invoiceId) => {
    try {
      setLastResponse({ message: 'Marking as unpaid...', type: 'info' });
      const res = await markInvoiceAsUnpaid(invoiceId);
      setLastResponse({ message: res.message || 'Invoice marked as unpaid!', type: 'success' });
      fetchInvoices();
    } catch (e) {
      setLastResponse({ message: e || 'Failed to mark as unpaid.', type: 'error' });
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleSuccess = (response) => {
    setLastResponse(response);
    setIsCreating(false);
    fetchInvoices();
  };

  const columns = [
    {
      key: "invoiceNumber",
      label: "INVOICE #",
      render: (val) => <span className="cs-mono" style={{fontWeight: 600}}>{val}</span>
    },
    {
      key: "soldAtUtc",
      label: "DATE",
      render: (val) => new Date(val).toLocaleDateString()
    },
    {
      key: "customerName",
      label: "CUSTOMER"
    },
    {
      key: "staffName",
      label: "REPRESENTATIVE",
      render: (val) => val || 'N/A'
    },
    {
      key: "status",
      label: "STATUS",
      render: (_, inv) => inv.isPaid ? (
        <span className="status-badge status-badge--success">Paid</span>
      ) : (
        <span className="status-badge status-badge--warning">Pending</span>
      )
    },
    {
      key: "amount",
      label: "AMOUNT",
      render: (_, inv) => <span style={{ fontWeight: 600 }}>Rs. {inv.totalAmount.toFixed(2)}</span>
    },
    {
      key: "actions",
      label: "ACTIONS",
      render: (_, inv) => (
        <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
          <Button variant="secondary" size="sm" onClick={() => handleSendEmail(inv.invoiceId)}>
            Send Email
          </Button>
          {!inv.isPaid ? (
            <Button variant="primary" size="sm" onClick={() => handleMarkAsPaid(inv.invoiceId)}>
              Mark as Paid
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => handleMarkAsUnpaid(inv.invoiceId)}>
              Mark as Unpaid
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="vendor-page">
      <div className="vendor-page-header">
        <div>
          <h1 className="vendor-page-title">Sales Invoices</h1>
          <p className="vendor-page-subtitle">Manage customer orders, process sales, and generate invoices.</p>
        </div>
        <div>
          {!isCreating && (
            <Button variant="primary" onClick={() => setIsCreating(true)}>
              + New invoice
            </Button>
          )}
        </div>
      </div>

      {lastResponse && !isCreating && (
        <div className={`vendor-page-notification vendor-page-notification--${lastResponse.type === 'error' ? 'error' : 'success'}`}>
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
          <div className="vendor-page-header" style={{ marginBottom: '16px' }}>
            <h2 className="vendor-page-title" style={{ fontSize: '18px' }}>Recent Invoices</h2>
          </div>
          
          <Table 
            columns={columns} 
            data={invoices} 
            loading={isLoading} 
            emptyMessage="No recent invoices. Click '+ New invoice' to get started." 
            onRowClick={setSelectedInvoice}
          />
        </div>
      )}

      {selectedInvoice && (
        <InvoiceDetailModal 
          invoice={selectedInvoice} 
          onClose={() => setSelectedInvoice(null)} 
        />
      )}
    </div>
  );
}

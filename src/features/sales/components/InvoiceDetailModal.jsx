import './InvoiceDetailModal.css';

export default function InvoiceDetailModal({ invoice, onClose }) {
  if (!invoice) return null;

  // Safeguard against casing issues if the API returns PascalCase
  const getVal = (obj, key) => obj[key] ?? obj[key.charAt(0).toUpperCase() + key.slice(1)];

  const invoiceNumber = getVal(invoice, 'invoiceNumber');
  const soldAtUtc = getVal(invoice, 'soldAtUtc');
  const customerName = getVal(invoice, 'customerName');
  const staffName = getVal(invoice, 'staffName');
  const subTotal = getVal(invoice, 'subTotal') || 0;
  const totalAmount = getVal(invoice, 'totalAmount') || 0;
  const discountAmount = getVal(invoice, 'discountAmount') || 0;
  const loyaltyDiscountApplied = getVal(invoice, 'loyaltyDiscountApplied');
  const isPaid = getVal(invoice, 'isPaid');
  const items = getVal(invoice, 'items') || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content invoice-simple-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Sales Invoice Details</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <div className="invoice-meta">
            <p><strong>Invoice #:</strong> {invoiceNumber}</p>
            <p><strong>Date:</strong> {soldAtUtc ? new Date(soldAtUtc).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Customer:</strong> {customerName}</p>
            <p><strong>Staff Rep:</strong> {staffName || 'N/A'}</p>
          </div>

          <table className="simple-table">
            <thead>
              <tr>
                <th>Part</th>
                <th className="text-right">Price</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td>{getVal(item, 'partName')}</td>
                  <td className="text-right">Rs. {(getVal(item, 'unitPrice') || 0).toFixed(2)}</td>
                  <td className="text-center">{getVal(item, 'quantity')}</td>
                  <td className="text-right">Rs. {(getVal(item, 'subTotal') || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="invoice-totals">
            <div className="total-row">
              <span>Sub-Total:</span>
              <span>Rs. {subTotal.toFixed(2)}</span>
            </div>
            {loyaltyDiscountApplied && (
              <div className="total-row text-success">
                <span>Loyalty Discount (10%):</span>
                <span>-Rs. {discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="total-row grand-total">
              <span>Total Amount:</span>
              <span>Rs. {totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className={`payment-status ${isPaid ? 'paid' : 'pending'}`}>
            {isPaid ? 'PAYMENT RECEIVED' : 'PAYMENT PENDING'}
          </div>
        </div>

        <div className="modal-actions">
          <button className="cs-button cs-button--ghost" onClick={() => window.print()}>Print</button>
          <button className="cs-button cs-button--primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

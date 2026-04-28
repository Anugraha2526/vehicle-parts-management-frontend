import { useState } from 'react';
import { createSalesInvoice } from '../../../api/salesApi';

export default function CreateInvoiceModule({ onSuccess, onCancel }) {
  const [customerId, setCustomerId] = useState('f4a2b3c1-2d5e-4f6a-8b9c-1d2e3f4a5b6c'); // default to Bikash
  const [staffId, setStaffId] = useState('c7f3d2a1-1b4e-4c8f-9a2d-3e5f6b7c8d9e'); // default to Anugraha
  const [items, setItems] = useState([{ partId: 'a1b2c3d4-1111-2222-3333-444455556666', quantity: 1 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Available Mock Parts for the dropdown based on backend seed
  const partsList = [
    { id: 'a1b2c3d4-1111-2222-3333-444455556666', name: 'NGK Spark Plug', price: 350 },
    { id: 'b2c3d4e5-2222-3333-4444-555566667777', name: 'Bosch Brake Disc', price: 1200 },
    { id: 'e5f6a7b8-5555-6666-7777-888899990000', name: 'Clutch Plate Kit', price: 8500 }
  ];

  const handleAddItem = () => {
    setItems([...items, { partId: partsList[0].id, quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calcSubTotal = () => {
    return items.reduce((total, item) => {
      const part = partsList.find((p) => p.id === item.partId);
      return total + (part ? part.price * item.quantity : 0);
    }, 0);
  };
  
  const subTotal = calcSubTotal();
  const discount = subTotal > 5000 ? subTotal * 0.1 : 0;
  const totalAmount = subTotal - discount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await createSalesInvoice({
        customerId,
        staffId,
        items: items.map(i => ({ partId: i.partId, quantity: parseInt(i.quantity, 10) }))
      });
      onSuccess(response);
    } catch (err) {
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cs-card invoice-module">
      <div className="card-heading">
        <h2 className="page-title" style={{ fontSize: '1.2rem', marginBottom: 0 }}>Create New Invoice</h2>
      </div>
      
      {error && (
        <div className="cs-alert cs-alert--error" style={{ marginBottom: '14px' }}>
          {error}
        </div>
      )}

      <form className="cs-form" onSubmit={handleSubmit}>
        <div className="cs-form-grid" style={{ marginBottom: '16px' }}>
          <label className="cs-field">
            Customer ID
            <input 
              type="text" 
              className="cs-input cs-mono" 
              value={customerId} 
              onChange={(e) => setCustomerId(e.target.value)} 
              required 
            />
          </label>
          <label className="cs-field">
            Staff ID
            <input 
              type="text" 
              className="cs-input cs-mono" 
              value={staffId} 
              onChange={(e) => setStaffId(e.target.value)} 
              required 
            />
          </label>
        </div>

        <div className="invoice-items">
          <div className="card-heading">
            <h3 className="cs-field" style={{ fontSize: '1rem', color: 'var(--ink-900)' }}>Line Items</h3>
            <button type="button" className="cs-button cs-button--ghost" onClick={handleAddItem}>
              + Add Part
            </button>
          </div>

          <table className="cs-table" style={{ marginBottom: '16px' }}>
            <thead>
              <tr>
                <th>Part</th>
                <th width="100">Price (NPR)</th>
                <th width="100">Qty</th>
                <th width="120">Subtotal</th>
                <th width="50"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const part = partsList.find((p) => p.id === item.partId);
                const price = part ? part.price : 0;
                const lineTotal = price * item.quantity;
                return (
                  <tr key={index}>
                    <td>
                      <select 
                        className="cs-select" 
                        value={item.partId}
                        onChange={(e) => handleItemChange(index, 'partId', e.target.value)}
                      >
                        {partsList.map((p) => (
                          <option key={p.id} value={p.id}>{p.name} ({p.id.substring(0, 8)}...)</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ verticalAlign: 'middle' }}>{price.toFixed(2)}</td>
                    <td>
                      <input 
                        type="number" 
                        min="1" 
                        className="cs-input" 
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      />
                    </td>
                    <td style={{ verticalAlign: 'middle', fontWeight: 600 }}>{lineTotal.toFixed(2)}</td>
                    <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                      {items.length > 1 && (
                        <button type="button" className="cs-button cs-button--ghost" onClick={() => handleRemoveItem(index)} style={{ padding: '4px 8px' }}>
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="invoice-summary" style={{ 
          background: 'var(--bg-app)', 
          padding: '24px', 
          borderRadius: '12px', 
          marginTop: '16px',
          border: '1px solid var(--line-soft)',
          boxShadow: '0 2px 10px rgba(44, 42, 38, 0.02) inset'
        }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
             <span className="cs-field">Sub-Total:</span>
             <span className="summary-value summary-value--money">Rs. {subTotal.toFixed(2)}</span>
           </div>
           {discount > 0 && (
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--ok)' }}>
               <span className="cs-field" style={{ color: 'var(--ok-ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                 <span style={{background: 'var(--ok-soft)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem'}}>OFFER</span>
                 Loyalty Discount (10%):
               </span>
               <span className="summary-value summary-value--money" style={{ color: 'var(--ok-ink)' }}>-Rs. {discount.toFixed(2)}</span>
             </div>
           )}
           <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--line-strong)' }}>
             <span className="cs-field" style={{ color: 'var(--ink-900)', fontSize: '1.2rem' }}>Total Amount:</span>
             <span className="summary-value summary-value--money" style={{ color: 'var(--accent-press)', fontSize: '1.6rem', textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
               Rs. {totalAmount.toFixed(2)}
             </span>
           </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button type="button" className="cs-button cs-button--ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="cs-button cs-button--primary" disabled={isSubmitting} style={{minWidth: '140px'}}>
            {isSubmitting ? 'Processing...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}

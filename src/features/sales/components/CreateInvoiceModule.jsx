import { useState, useEffect } from 'react';
import { createSalesInvoice } from '../../../api/salesApi';
import { customerApi } from '../../../api/customerApi';
import { staffApi } from '../../../api/staffApi';
import { partsApi } from '../../../api/partsApi';

export default function CreateInvoiceModule({ onSuccess, onCancel }) {
  const [customers, setCustomers] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [partsList, setPartsList] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [customerId, setCustomerId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [items, setItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Use allSettled so one failing call doesn't crash the whole form
        const [custResult, staffResult, partsResult] = await Promise.allSettled([
          customerApi.list(),
          staffApi.getAll(),
          partsApi.list() 
        ]);

        const rawCust = custResult.status === 'fulfilled'
          ? (custResult.value.data?.data || custResult.value.data || []) : [];
        const rawStaff = staffResult.status === 'fulfilled'
          ? (staffResult.value.data?.data || staffResult.value.data || []) : [];
        const rawParts = partsResult.status === 'fulfilled'
          ? (Array.isArray(partsResult.value) ? partsResult.value : (partsResult.value?.data || [])) : [];

        const cData = Array.isArray(rawCust) ? rawCust : [];
        const sData = Array.isArray(rawStaff) 
          ? rawStaff.filter(s => (s.role || s.Role) === 'Staff') 
          : [];
        const pData = Array.isArray(rawParts) ? rawParts : [];

        setCustomers(cData);
        setStaffList(sData);

        const mappedParts = pData.map(p => ({
          id: p.id || p.Id,
          name: p.partName || p.PartName || p.name || p.Name || 'Unknown Part',
          price: p.sellingPrice || p.SellingPrice || p.unitPrice || p.UnitPrice || p.price || p.Price || 0
        }));

        setPartsList(mappedParts);

        if (cData.length > 0) setCustomerId(cData[0].id || cData[0].Id);
        if (sData.length > 0) setStaffId(sData[0].id || sData[0].Id);
        if (mappedParts.length > 0 && mappedParts[0].id) {
          setItems([{ partId: mappedParts[0].id, quantity: 1 }]);
        } else {
          setItems([{ partId: '', quantity: 1 }]);
        }

        // Show warning if parts couldn't load
        if (partsResult.status === 'rejected') {
          const detail = partsResult.reason?.response?.status 
            ? `(HTTP ${partsResult.reason.response.status})`
            : String(partsResult.reason?.message || "Unknown error");
            
          console.error("Parts request failed details:", partsResult.reason);
          setError(`Parts list could not be loaded ${detail}. Try refreshing or logging in again.`);
        }
      } catch (err) {
        console.error("Failed to load initial data", err);
        setError("Could not load form options from server. Please try again.");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleAddItem = () => {
    // Scalable check: default to empty string if no parts exist in the live database yet.
    const defaultPartId = partsList.length > 0 ? (partsList[0].id || partsList[0].Id) : "";
    setItems([...items, { partId: defaultPartId, quantity: 1 }]);
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
      
      {isLoadingData ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-500)' }}>
          Loading options...
        </div>
      ) : (
        <>
          {error && (
            <div className="cs-alert cs-alert--error" style={{ marginBottom: '14px' }}>
              {error}
            </div>
          )}

      <form className="cs-form" onSubmit={handleSubmit}>
        <div className="cs-form-grid" style={{ marginBottom: '16px' }}>
          <label className="cs-field">
            Customer
            <select 
              className="cs-select" 
              value={customerId} 
              onChange={(e) => setCustomerId(e.target.value)} 
              required
            >
              <option value="" disabled>Select Customer</option>
              {(customers || []).map((c) => {
                const cId = c.id || c.Id;
                return (
                  <option key={cId} value={cId}>{c.fullName || c.FullName || c.name || `ID: ${(cId || '').substring(0, 8)}`}</option>
                );
              })}
            </select>
          </label>
          <label className="cs-field">
            Staff Rep
            <select 
              className="cs-select" 
              value={staffId} 
              onChange={(e) => setStaffId(e.target.value)} 
              required
            >
              <option value="" disabled>Select Staff</option>
              {(staffList || []).map((s) => {
                const sId = s.id || s.Id;
                return (
                  <option key={sId} value={sId}>{s.fullName || s.FullName || s.name || `ID: ${(sId || '').substring(0, 8)}`}</option>
                );
              })}
            </select>
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
                        {(partsList || []).map((p) => (
                          <option key={p.id} value={p.id}>{p.name} ({(p.id || '').substring(0, 8)}...)</option>
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
          border: '1px solid var(--line-soft)'
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
          <button type="submit" className="cs-button cs-button--primary" disabled={isSubmitting || partsList.length === 0} style={{minWidth: '140px'}}>
            {isSubmitting ? 'Processing...' : 'Create Invoice'}
          </button>
        </div>
      </form>
      </>
      )}
    </div>
  );
}

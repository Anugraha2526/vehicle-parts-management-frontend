import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', email: '', phoneNumber: '', address: '' });
  const [vehicleForm, setVehicleForm] = useState({ vehicleNumber: '', make: '', model: '', year: new Date().getFullYear() });

  const fetchDetails = async () => {
    try {
      const data = await api.get(`/Customers/${id}`);
      setCustomer(data);
      setEditForm({ 
        fullName: data.fullName, 
        email: data.email, 
        phoneNumber: data.phoneNumber, 
        address: data.address 
      });
    } catch (error) {
      console.error('Error fetching customer details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/Customers/${id}/profile`, editForm);
      alert('Profile updated successfully!');
      setIsEditing(false);
      fetchDetails();
    } catch (error) {
      alert('Failed to update profile.');
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/Customers/${id}/vehicles`, vehicleForm);
      alert('Vehicle added successfully!');
      setIsAddingVehicle(false);
      setVehicleForm({ vehicleNumber: '', make: '', model: '', year: new Date().getFullYear() });
      fetchDetails();
    } catch (error) {
      alert('Failed to add vehicle.');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-500)' }}>Loading customer details...</div>;
  if (!customer) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--err)' }}>Customer not found.</div>;

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
         <div>
            <button onClick={() => navigate('/staff/customers')} className="cs-button cs-button--ghost" style={{ padding: '0', marginBottom: '12px', color: 'var(--ink-500)' }}>← Back to Customers</button>
            <h1 className="page-title" style={{ fontSize: '28px', fontWeight: 700 }}>{customer.fullName}</h1>
            <p style={{ color: 'var(--ink-500)', marginTop: '4px' }}>Customer ID: {customer.id}</p>
         </div>
         <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setIsEditing(true)} className="cs-button cs-button--secondary">✏️ Edit Profile</button>
            <button onClick={() => setIsAddingVehicle(true)} className="cs-button cs-button--primary">🚗 Add Vehicle</button>
         </div>
      </div>

      {isEditing && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--cs-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleUpdateProfile} className="cs-card cs-form" style={{ width: '400px' }}>
            <h2 className="page-title" style={{ fontSize: '20px', marginBottom: '16px' }}>Edit Profile</h2>
            <div className="cs-field">
              <label>Full Name</label>
              <input type="text" className="cs-input" value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} required />
            </div>
            <div className="cs-field">
              <label>Phone Number</label>
              <input type="text" className="cs-input" value={editForm.phoneNumber} onChange={e => setEditForm({...editForm, phoneNumber: e.target.value})} required />
            </div>
            <div className="cs-field">
              <label>Address</label>
              <input type="text" className="cs-input" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} required />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" className="cs-button cs-button--primary">Save Changes</button>
              <button type="button" onClick={() => setIsEditing(false)} className="cs-button cs-button--ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {isAddingVehicle && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--cs-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleAddVehicle} className="cs-card cs-form" style={{ width: '400px' }}>
            <h2 className="page-title" style={{ fontSize: '20px', marginBottom: '16px' }}>Add New Vehicle</h2>
            <div className="cs-field">
              <label>Vehicle Number</label>
              <input type="text" className="cs-input" placeholder="BA-1-PA-1234" value={vehicleForm.vehicleNumber} onChange={e => setVehicleForm({...vehicleForm, vehicleNumber: e.target.value})} required />
            </div>
            <div className="cs-field">
              <label>Make</label>
              <input type="text" className="cs-input" placeholder="Honda" value={vehicleForm.make} onChange={e => setVehicleForm({...vehicleForm, make: e.target.value})} required />
            </div>
            <div className="cs-field">
              <label>Model</label>
              <input type="text" className="cs-input" placeholder="Civic" value={vehicleForm.model} onChange={e => setVehicleForm({...vehicleForm, model: e.target.value})} required />
            </div>
            <div className="cs-field">
              <label>Year</label>
              <input type="number" className="cs-input" value={vehicleForm.year} onChange={e => setVehicleForm({...vehicleForm, year: parseInt(e.target.value)})} required />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" className="cs-button cs-button--primary">Add Vehicle</button>
              <button type="button" onClick={() => setIsAddingVehicle(false)} className="cs-button cs-button--ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="cs-form-grid">
        <div className="cs-card">
          <h2 className="page-title" style={{ fontSize: '18px', marginBottom: '20px', borderBottom: '1px solid var(--line-soft)', paddingBottom: '12px' }}>Personal Information</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div className="cs-helper">Email Address</div>
              <div style={{ fontSize: '16px', color: 'var(--ink-900)' }}>{customer.email}</div>
            </div>
            <div>
              <div className="cs-helper">Phone Number</div>
              <div style={{ fontSize: '16px', color: 'var(--ink-900)' }}>{customer.phoneNumber}</div>
            </div>
            <div>
              <div className="cs-helper">Address</div>
              <div style={{ fontSize: '16px', color: 'var(--ink-900)' }}>{customer.address}</div>
            </div>
          </div>
        </div>

        <div className="cs-card">
          <h2 className="page-title" style={{ fontSize: '18px', marginBottom: '20px', borderBottom: '1px solid var(--line-soft)', paddingBottom: '12px' }}>Registered Vehicles</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {customer.vehicles.map((v) => (
              <div key={v.id} style={{ padding: '16px', border: '1px solid var(--line-soft)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div className="cs-mono" style={{ fontWeight: 700, fontSize: '16px', color: 'var(--ink-900)' }}>{v.vehicleNumber}</div>
                    <div className="cs-muted">{v.year} {v.make} {v.model}</div>
                </div>
                <span className="status-badge status-badge--success">Active</span>
              </div>
            ))}
            {customer.vehicles.length === 0 && (
              <div className="cs-muted">No vehicles registered.</div>
            )}
          </div>
        </div>
      </div>

      <div className="cs-card" style={{ marginTop: '24px' }}>
        <h2 className="page-title" style={{ fontSize: '18px', marginBottom: '20px' }}>Service and Purchase History</h2>
        {customer.transactions && customer.transactions.length > 0 ? (
           <div className="cs-table-wrapper">
             <table className="cs-table">
               <thead>
                 <tr>
                   <th>Date</th>
                   <th>Type</th>
                   <th>Description</th>
                   <th>Amount</th>
                 </tr>
               </thead>
               <tbody>
                 {customer.transactions.map((t) => (
                   <tr key={t.id}>
                     <td>{new Date(t.date).toLocaleDateString()}</td>
                     <td><span className="status-badge status-badge--info">{t.type}</span></td>
                     <td>{t.description}</td>
                     <td className="cs-mono" style={{ fontWeight: 700, color: 'var(--ink-900)' }}>Rs. {t.totalAmount}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        ) : (
          <p style={{ color: 'var(--ink-500)', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No history found for this customer.</p>
        )}
      </div>
    </div>
  );
};

export default CustomerDetails;

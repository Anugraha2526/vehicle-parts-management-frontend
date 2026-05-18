import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const CustomerProfile = () => {
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
      console.error('Error fetching profile:', error);
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
      alert('Your profile has been updated!');
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
      alert('Vehicle added to your account!');
      setIsAddingVehicle(false);
      setVehicleForm({ vehicleNumber: '', make: '', model: '', year: new Date().getFullYear() });
      fetchDetails();
    } catch (error) {
      alert('Failed to add vehicle.');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-500)' }}>Loading your profile...</div>;
  if (!customer) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--err)' }}>Profile not found.</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px' }}>
      {/* Customer Page Banner */}
      <div style={{ 
        backgroundColor: '#FCFAF7', 
        border: '1px solid var(--line-strong)', 
        padding: '16px 24px', 
        borderRadius: '12px', 
        marginBottom: '32px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px' 
      }}>
        <span style={{ fontSize: '24px' }}>👤</span>
        <div>
          <h4 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: 'var(--accent)', margin: 0, fontSize: '18px' }}>This is Customer Page</h4>
          <p style={{ color: 'var(--ink-500)', margin: 0, fontSize: '13px', marginTop: '2px' }}>You are logged into your secure self-service customer portal.</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
         <div>
            <h1 className="page-title" style={{ fontSize: '32px', fontWeight: 700 }}>My Profile</h1>
            <p style={{ color: 'var(--ink-500)', marginTop: '4px' }}>Welcome back, {customer.fullName}</p>
         </div>
         <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setIsEditing(true)} className="cs-button cs-button--secondary">✏️ Edit My Info</button>
            <button onClick={() => setIsAddingVehicle(true)} className="cs-button cs-button--primary">🚗 Register New Vehicle</button>
            <button onClick={() => navigate('/login')} className="cs-button cs-button--ghost" style={{ color: 'var(--err)' }}>Log Out</button>
         </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--cs-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleUpdateProfile} className="cs-card cs-form" style={{ width: '400px' }}>
            <h2 className="page-title" style={{ fontSize: '20px', marginBottom: '16px' }}>Edit My Information</h2>
            <div className="cs-field">
              <label>Full Name</label>
              <input type="text" className="cs-input" value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} required />
            </div>
            <div className="cs-field">
              <label>Phone Number</label>
              <input type="text" className="cs-input" value={editForm.phoneNumber} onChange={e => setEditForm({...editForm, phoneNumber: e.target.value})} required />
            </div>
            <div className="cs-field">
              <label>Residential Address</label>
              <input type="text" className="cs-input" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} required />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" className="cs-button cs-button--primary">Save Changes</button>
              <button type="button" onClick={() => setIsEditing(false)} className="cs-button cs-button--ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {isAddingVehicle && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--cs-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleAddVehicle} className="cs-card cs-form" style={{ width: '400px' }}>
            <h2 className="page-title" style={{ fontSize: '20px', marginBottom: '16px' }}>Register New Vehicle</h2>
            <div className="cs-field">
              <label>Vehicle Number</label>
              <input type="text" className="cs-input" value={vehicleForm.vehicleNumber} onChange={e => setVehicleForm({...vehicleForm, vehicleNumber: e.target.value})} required />
            </div>
            <div className="cs-field">
              <label>Make</label>
              <input type="text" className="cs-input" value={vehicleForm.make} onChange={e => setVehicleForm({...vehicleForm, make: e.target.value})} required />
            </div>
            <div className="cs-field">
              <label>Model</label>
              <input type="text" className="cs-input" value={vehicleForm.model} onChange={e => setVehicleForm({...vehicleForm, model: e.target.value})} required />
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
          <h2 className="page-title" style={{ fontSize: '18px', marginBottom: '20px', borderBottom: '1px solid var(--line-soft)', paddingBottom: '12px' }}>My Account Info</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div className="cs-helper">Email Address</div>
              <div style={{ fontSize: '16px', color: 'var(--ink-900)' }}>{customer.email}</div>
            </div>
            <div>
              <div className="cs-helper">Primary Phone</div>
              <div style={{ fontSize: '16px', color: 'var(--ink-900)' }}>{customer.phoneNumber}</div>
            </div>
            <div>
              <div className="cs-helper">Address</div>
              <div style={{ fontSize: '16px', color: 'var(--ink-900)' }}>{customer.address}</div>
            </div>
          </div>
        </div>

        <div className="cs-card">
          <h2 className="page-title" style={{ fontSize: '18px', marginBottom: '20px', borderBottom: '1px solid var(--line-soft)', paddingBottom: '12px' }}>My Registered Vehicles</h2>
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
          </div>
        </div>
      </div>

      <div className="cs-card" style={{ marginTop: '24px' }}>
        <h2 className="page-title" style={{ fontSize: '18px', marginBottom: '20px' }}>My Service History</h2>
        {customer.transactions && customer.transactions.length > 0 ? (
           <div className="cs-table-wrapper">
             <table className="cs-table">
               <thead>
                 <tr>
                   <th>Date</th>
                   <th>Service Type</th>
                   <th>Description</th>
                   <th>Total Paid</th>
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
          <p style={{ color: 'var(--ink-500)', fontSize: '14px', textAlign: 'center', padding: '20px' }}>You haven't had any services yet. Your history will appear here!</p>
        )}
      </div>
    </div>
  );
};

export default CustomerProfile;

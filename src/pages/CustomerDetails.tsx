import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const CustomerDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Feature 12: Manage details state
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
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

  const handleAddVehicle = async (e: React.FormEvent) => {
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

  if (loading) return <div>Loading...</div>;
  if (!customer) return <div>Customer not found.</div>;

  return (
    <div className="customer-details">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate('/customers')} className="btn btn-outline" style={{ padding: '8px 12px' }}>← Back</button>
            <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Customer: {customer.fullName}</h1>
         </div>
         <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setIsEditing(true)} className="btn btn-outline">✏️ Edit Profile</button>
            <button onClick={() => setIsAddingVehicle(true)} className="btn btn-primary">🚗 Add Vehicle</button>
         </div>
      </div>

      {/* Feature 12: Edit Profile Modal */}
      {isEditing && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleUpdateProfile} className="card" style={{ width: '400px' }}>
            <h2 style={{ marginBottom: '20px' }}>Edit Profile</h2>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="text" className="form-input" value={editForm.phoneNumber} onChange={e => setEditForm({...editForm, phoneNumber: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input type="text" className="form-input" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} required />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" className="btn btn-primary">Save Changes</button>
              <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Feature 12: Add Vehicle Modal */}
      {isAddingVehicle && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleAddVehicle} className="card" style={{ width: '400px' }}>
            <h2 style={{ marginBottom: '20px' }}>Add New Vehicle</h2>
            <div className="form-group">
              <label className="form-label">Vehicle Number</label>
              <input type="text" className="form-input" value={vehicleForm.vehicleNumber} onChange={e => setVehicleForm({...vehicleForm, vehicleNumber: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Make</label>
              <input type="text" className="form-input" value={vehicleForm.make} onChange={e => setVehicleForm({...vehicleForm, make: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Model</label>
              <input type="text" className="form-input" value={vehicleForm.model} onChange={e => setVehicleForm({...vehicleForm, model: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Year</label>
              <input type="number" className="form-input" value={vehicleForm.year} onChange={e => setVehicleForm({...vehicleForm, year: parseInt(e.target.value)})} required />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" className="btn btn-primary">Add Vehicle</button>
              <button type="button" onClick={() => setIsAddingVehicle(false)} className="btn btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="form-grid">
        <div className="card">
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Personal Information</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Email</div>
              <div>{customer.email}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Phone</div>
              <div>{customer.phoneNumber}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Address</div>
              <div>{customer.address}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Vehicles</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {customer.vehicles.map((v: any) => (
              <div key={v.id} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <div style={{ fontWeight: 600 }}>{v.vehicleNumber}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{v.year} {v.make} {v.model}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Service & Purchase History</h2>
        {customer.transactions && customer.transactions.length > 0 ? (
           <div className="table-container">
             <table>
               <thead>
                 <tr>
                   <th>Date</th>
                   <th>Type</th>
                   <th>Description</th>
                   <th>Amount</th>
                 </tr>
               </thead>
               <tbody>
                 {customer.transactions.map((t: any) => (
                   <tr key={t.id}>
                     <td>{new Date(t.date).toLocaleDateString()}</td>
                     <td>{t.type}</td>
                     <td>{t.description}</td>
                     <td style={{ fontWeight: 600 }}>Rs. {t.totalAmount}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No history found for this customer.</p>
        )}
      </div>
    </div>
  );
};

export default CustomerDetails;

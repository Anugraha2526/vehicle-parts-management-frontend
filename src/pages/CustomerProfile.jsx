import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AiChatWidget from '../components/common/AiChatWidget';
import { api } from '../services/api';

const CustomerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', email: '', phoneNumber: '', address: '', vehicles: [] });
  const [deletedVehicleIds, setDeletedVehicleIds] = useState([]);
  const [vehicleForm, setVehicleForm] = useState({ vehicleNumber: '', make: '', model: '', year: new Date().getFullYear() });
  const [errors, setErrors] = useState({});

  const fetchDetails = async () => {
    try {
      const data = await api.get(`/Customers/${id}`);
      setCustomer(data);
      setEditForm({ 
        fullName: data.fullName, 
        email: data.email, 
        phoneNumber: data.phoneNumber, 
        address: data.address,
        vehicles: data.vehicles ? data.vehicles.map(v => ({ ...v })) : []
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

  const handleStartEdit = () => {
    setDeletedVehicleIds([]);
    setErrors({});
    setEditForm({ 
      fullName: customer.fullName, 
      email: customer.email, 
      phoneNumber: customer.phoneNumber, 
      address: customer.address,
      vehicles: customer.vehicles ? customer.vehicles.map(v => ({ ...v })) : []
    });
    setIsEditing(true);
  };

  const handleVehicleChange = (index, field, value) => {
    const updatedVehicles = [...editForm.vehicles];
    updatedVehicles[index] = { ...updatedVehicles[index], [field]: value };
    setEditForm({ ...editForm, vehicles: updatedVehicles });
    
    if (errors.vehicles && errors.vehicles[index] && errors.vehicles[index][field]) {
      const newVehiclesErr = [...errors.vehicles];
      newVehiclesErr[index] = { ...newVehiclesErr[index], [field]: '' };
      setErrors(prev => ({ ...prev, vehicles: newVehiclesErr }));
    }
  };

  const handleAddVehicleInEdit = () => {
    setEditForm({
      ...editForm,
      vehicles: [
        ...editForm.vehicles,
        { id: '', vehicleNumber: '', make: '', model: '', year: new Date().getFullYear(), isNew: true }
      ]
    });
  };

  const handleRemoveVehicle = (index, vehicleId) => {
    if (vehicleId && !editForm.vehicles[index].isNew) {
      setDeletedVehicleIds([...deletedVehicleIds, vehicleId]);
    }
    const updatedVehicles = editForm.vehicles.filter((_, idx) => idx !== index);
    setEditForm({ ...editForm, vehicles: updatedVehicles });
    
    if (errors.vehicles) {
      const newVehiclesErr = errors.vehicles.filter((_, idx) => idx !== index);
      setErrors(prev => ({ ...prev, vehicles: newVehiclesErr }));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const tempErrors = {};
    
    // Validate Profile
    const nameParts = (editForm.fullName || '').trim().split(/\s+/);
    if (!editForm.fullName || editForm.fullName.trim() === '') {
      tempErrors.fullName = "Full Name is required.";
    } else if (nameParts.length < 2) {
      tempErrors.fullName = "Full Name must contain at least two words (First and Last Name).";
    } else if (nameParts.some(part => !/^[a-zA-Z]+$/.test(part))) {
      tempErrors.fullName = "Full Name can only contain letters.";
    } else if (nameParts[0].length < 3 || nameParts[1].length < 3) {
      tempErrors.fullName = "Both First and Last Name must be at least 3 letters long.";
    }
    
    if (!editForm.phoneNumber) {
      tempErrors.phoneNumber = "Phone Number is required.";
    } else if (!/^\d+$/.test(editForm.phoneNumber)) {
      tempErrors.phoneNumber = "Phone Number must contain only numeric digits.";
    } else if (editForm.phoneNumber.length !== 10) {
      tempErrors.phoneNumber = "Phone Number must be exactly 10 digits.";
    }
    
    if (!editForm.address || editForm.address.trim().length < 5) {
      tempErrors.address = "Address must be at least 5 characters.";
    }

    // Validate Vehicles
    const vehicleErrors = [];
    let hasVehicleError = false;
    editForm.vehicles.forEach((v, index) => {
      const vErr = {};
      if (!v.vehicleNumber || v.vehicleNumber.trim().length < 3) {
        vErr.vehicleNumber = "Vehicle number must be at least 3 characters.";
      } else if (!/^[a-zA-Z0-9\s-]+$/.test(v.vehicleNumber)) {
        vErr.vehicleNumber = "Invalid format.";
      }
      
      if (!v.make || v.make.trim().length < 2) {
        vErr.make = "Min 2 chars.";
      }
      
      if (!v.model || v.model.trim().length < 2) {
        vErr.model = "Min 2 chars.";
      }
      
      const currentYear = new Date().getFullYear();
      if (!v.year) {
        vErr.year = "Year is required.";
      } else if (!/^\d+$/.test(v.year.toString())) {
        vErr.year = "Only digits.";
      } else if (v.year < 1886 || v.year > currentYear + 1) {
        vErr.year = `Between 1886 and ${currentYear + 1}.`;
      }

      if (Object.keys(vErr).length > 0) {
        vehicleErrors[index] = vErr;
        hasVehicleError = true;
      }
    });

    if (Object.keys(tempErrors).length > 0 || hasVehicleError) {
      setErrors({ ...tempErrors, vehicles: vehicleErrors });
      return;
    }

    setErrors({});

    try {
      // 1. Update Profile Info
      await api.put(`/Customers/${id}/profile`, {
        fullName: editForm.fullName,
        phoneNumber: editForm.phoneNumber,
        address: editForm.address
      });

      // 2. Handle Deleted Vehicles
      for (const vehicleId of deletedVehicleIds) {
        await api.delete(`/Customers/${id}/vehicles/${vehicleId}`);
      }

      // 3. Handle Added/Updated Vehicles
      for (const v of editForm.vehicles) {
        if (v.isNew) {
          await api.post(`/Customers/${id}/vehicles`, {
            vehicleNumber: v.vehicleNumber,
            make: v.make,
            model: v.model,
            year: v.year
          });
        } else {
          await api.put(`/Customers/${id}/vehicles/${v.id}`, {
            id: v.id,
            vehicleNumber: v.vehicleNumber,
            make: v.make,
            model: v.model,
            year: v.year
          });
        }
      }

      alert('Your profile and vehicle details have been updated successfully!');
      setIsEditing(false);
      setDeletedVehicleIds([]);
      fetchDetails();
    } catch (error) {
      alert('Failed to update profile or vehicle details: ' + error.message);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    const tempErrors = {};
    if (!vehicleForm.vehicleNumber || vehicleForm.vehicleNumber.trim().length < 3) {
      tempErrors.addVehicleNumber = "Vehicle number must be at least 3 characters.";
    } else if (!/^[a-zA-Z0-9\s-]+$/.test(vehicleForm.vehicleNumber)) {
      tempErrors.addVehicleNumber = "Invalid format. Only alphanumeric, spaces, and hyphens.";
    }

    if (!vehicleForm.make || vehicleForm.make.trim().length < 2) {
      tempErrors.addMake = "Make is required (min 2 chars).";
    }

    if (!vehicleForm.model || vehicleForm.model.trim().length < 2) {
      tempErrors.addModel = "Model is required (min 2 chars).";
    }

    const currentYear = new Date().getFullYear();
    if (!vehicleForm.year) {
      tempErrors.addYear = "Year is required.";
    } else if (!/^\d+$/.test(vehicleForm.year.toString())) {
      tempErrors.addYear = "Year must contain only digits.";
    } else if (vehicleForm.year < 1886 || vehicleForm.year > currentYear + 1) {
      tempErrors.addYear = `Between 1886 and ${currentYear + 1}.`;
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...tempErrors }));
      return;
    }

    try {
      await api.post(`/Customers/${id}/vehicles`, vehicleForm);
      alert('Vehicle added to your account!');
      setIsAddingVehicle(false);
      setVehicleForm({ vehicleNumber: '', make: '', model: '', year: new Date().getFullYear() });
      setErrors({});
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
            <button onClick={handleStartEdit} className="cs-button cs-button--secondary">✏️ Edit My Info</button>
            <button onClick={() => setIsAddingVehicle(true)} className="cs-button cs-button--primary">🚗 Register New Vehicle</button>
            <button onClick={() => navigate('/login')} className="cs-button cs-button--ghost" style={{ color: 'var(--err)' }}>Log Out</button>
         </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'var(--cs-overlay)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <form onSubmit={handleUpdateProfile} className="cs-card cs-form" style={{ width: '800px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 className="page-title" style={{ fontSize: '24px', marginBottom: '4px', color: 'var(--accent)' }}>Edit My Information</h2>
              <p style={{ color: 'var(--ink-500)', fontSize: '13px' }}>Update your personal profile details and manage your registered vehicles below.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', borderTop: '1px solid var(--line-soft)', borderBottom: '1px solid var(--line-soft)', padding: '20px 0' }}>
              {/* Profile Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink-900)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  👤 Contact Details
                </h3>
                <div className="cs-field">
                  <label>Full Name</label>
                  <input type="text" className="cs-input" style={{ borderColor: errors.fullName ? 'var(--err)' : 'var(--line)' }} value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} required />
                  {errors.fullName && <span style={{ color: 'var(--err)', fontSize: '12px', marginTop: '2px' }}>⚠️ {errors.fullName}</span>}
                </div>
                <div className="cs-field">
                  <label>Phone Number</label>
                  <input type="text" className="cs-input" style={{ borderColor: errors.phoneNumber ? 'var(--err)' : 'var(--line)' }} value={editForm.phoneNumber} onChange={e => setEditForm({...editForm, phoneNumber: e.target.value})} required />
                  {errors.phoneNumber && <span style={{ color: 'var(--err)', fontSize: '12px', marginTop: '2px' }}>⚠️ {errors.phoneNumber}</span>}
                </div>
                <div className="cs-field">
                  <label>Residential Address</label>
                  <input type="text" className="cs-input" style={{ borderColor: errors.address ? 'var(--err)' : 'var(--line)' }} value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} required />
                  {errors.address && <span style={{ color: 'var(--err)', fontSize: '12px', marginTop: '2px' }}>⚠️ {errors.address}</span>}
                </div>
              </div>

              {/* Vehicles Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink-900)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🚗 My Vehicles
                  </h3>
                  <button 
                    type="button" 
                    onClick={handleAddVehicleInEdit} 
                    className="cs-button cs-button--secondary" 
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    ➕ Register Another
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '350px', paddingRight: '8px' }}>
                  {editForm.vehicles && editForm.vehicles.length > 0 ? (
                    editForm.vehicles.map((v, index) => {
                      const vErr = (errors.vehicles && errors.vehicles[index]) || {};
                      return (
                        <div key={index} style={{ padding: '16px', border: '1px solid var(--line-soft)', borderRadius: '12px', backgroundColor: '#FCFAF7', position: 'relative' }}>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveVehicle(index, v.id)} 
                            style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--err)', padding: '4px' }}
                            title="Remove Vehicle"
                          >
                            🗑️
                          </button>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                            <div className="cs-field" style={{ gridColumn: 'span 2' }}>
                              <label>Vehicle Number</label>
                              <input 
                                type="text" 
                                className="cs-input" 
                                style={{ borderColor: vErr.vehicleNumber ? 'var(--err)' : 'var(--line)' }}
                                value={v.vehicleNumber} 
                                onChange={e => handleVehicleChange(index, 'vehicleNumber', e.target.value)} 
                                placeholder="e.g. BA 2 PA 1234"
                                required 
                              />
                              {vErr.vehicleNumber && <span style={{ color: 'var(--err)', fontSize: '11px', marginTop: '2px' }}>⚠️ {vErr.vehicleNumber}</span>}
                            </div>
                            <div className="cs-field">
                              <label>Make</label>
                              <input 
                                type="text" 
                                className="cs-input" 
                                style={{ borderColor: vErr.make ? 'var(--err)' : 'var(--line)' }}
                                value={v.make} 
                                onChange={e => handleVehicleChange(index, 'make', e.target.value)} 
                                placeholder="e.g. Toyota"
                                required 
                              />
                              {vErr.make && <span style={{ color: 'var(--err)', fontSize: '11px', marginTop: '2px' }}>⚠️ {vErr.make}</span>}
                            </div>
                            <div className="cs-field">
                              <label>Model</label>
                              <input 
                                type="text" 
                                className="cs-input" 
                                style={{ borderColor: vErr.model ? 'var(--err)' : 'var(--line)' }}
                                value={v.model} 
                                onChange={e => handleVehicleChange(index, 'model', e.target.value)} 
                                placeholder="e.g. Corolla"
                                required 
                              />
                              {vErr.model && <span style={{ color: 'var(--err)', fontSize: '11px', marginTop: '2px' }}>⚠️ {vErr.model}</span>}
                            </div>
                            <div className="cs-field" style={{ gridColumn: 'span 2' }}>
                              <label>Year</label>
                              <input 
                                type="number" 
                                className="cs-input" 
                                style={{ borderColor: vErr.year ? 'var(--err)' : 'var(--line)' }}
                                value={v.year} 
                                onChange={e => handleVehicleChange(index, 'year', parseInt(e.target.value) || new Date().getFullYear())} 
                                placeholder="e.g. 2022"
                                required 
                              />
                              {vErr.year && <span style={{ color: 'var(--err)', fontSize: '11px', marginTop: '2px' }}>⚠️ {vErr.year}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '30px', textAlign: 'center', color: 'var(--ink-500)', fontSize: '13px', border: '1px dashed var(--line-strong)', borderRadius: '12px' }}>
                      No vehicles currently registered. Click "Register Another" to add.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setIsEditing(false)} className="cs-button cs-button--ghost">Cancel</button>
              <button type="submit" className="cs-button cs-button--primary">Save Profile & Vehicles</button>
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
              <input type="text" className="cs-input" style={{ borderColor: errors.addVehicleNumber ? 'var(--err)' : 'var(--line)' }} value={vehicleForm.vehicleNumber} onChange={e => setVehicleForm({...vehicleForm, vehicleNumber: e.target.value})} required />
              {errors.addVehicleNumber && <span style={{ color: 'var(--err)', fontSize: '12px', marginTop: '2px' }}>⚠️ {errors.addVehicleNumber}</span>}
            </div>
            <div className="cs-field">
              <label>Make</label>
              <input type="text" className="cs-input" style={{ borderColor: errors.addMake ? 'var(--err)' : 'var(--line)' }} value={vehicleForm.make} onChange={e => setVehicleForm({...vehicleForm, make: e.target.value})} required />
              {errors.addMake && <span style={{ color: 'var(--err)', fontSize: '12px', marginTop: '2px' }}>⚠️ {errors.addMake}</span>}
            </div>
            <div className="cs-field">
              <label>Model</label>
              <input type="text" className="cs-input" style={{ borderColor: errors.addModel ? 'var(--err)' : 'var(--line)' }} value={vehicleForm.model} onChange={e => setVehicleForm({...vehicleForm, model: e.target.value})} required />
              {errors.addModel && <span style={{ color: 'var(--err)', fontSize: '12px', marginTop: '2px' }}>⚠️ {errors.addModel}</span>}
            </div>
            <div className="cs-field">
              <label>Year</label>
              <input type="number" className="cs-input" style={{ borderColor: errors.addYear ? 'var(--err)' : 'var(--line)' }} value={vehicleForm.year} onChange={e => setVehicleForm({...vehicleForm, year: parseInt(e.target.value) || new Date().getFullYear()})} required />
              {errors.addYear && <span style={{ color: 'var(--err)', fontSize: '12px', marginTop: '2px' }}>⚠️ {errors.addYear}</span>}
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
      <AiChatWidget />
    </div>
  );
};

export default CustomerProfile;

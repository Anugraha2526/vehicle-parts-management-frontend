import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import '../features/customer-portal/pages/CustomerPortal.css';

const CustomerProfile = () => {
  const { id: paramId } = useParams();
  const { user } = useAuth();
  const id = paramId || user?.id;
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', email: '', phoneNumber: '', address: '', vehicles: [] });
  const [deletedVehicleIds, setDeletedVehicleIds] = useState([]);
  const [editErrors, setEditErrors] = useState({});

  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [submittingVehicle, setSubmittingVehicle] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({ vehicleNumber: '', make: '', model: '', year: new Date().getFullYear() });
  const [vehicleErrors, setVehicleErrors] = useState({});

  const [fetchError, setFetchError] = useState(null);

  function showNotification(type, message) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  }

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
      if (error.message.includes('401') || error.message.includes('403')) {
        setFetchError('auth');
      } else {
        setFetchError('fetch');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetails(); }, [id]);

  function handleStartEdit() {
    setDeletedVehicleIds([]);
    setEditErrors({});
    setEditForm({
      fullName: customer.fullName,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      address: customer.address,
      vehicles: customer.vehicles ? customer.vehicles.map(v => ({ ...v })) : []
    });
    setIsEditing(true);
  }

  function handleVehicleChange(index, field, value) {
    const updated = [...editForm.vehicles];
    updated[index] = { ...updated[index], [field]: value };
    setEditForm(f => ({ ...f, vehicles: updated }));

    if (editErrors.vehicles?.[index]?.[field]) {
      const errs = [...(editErrors.vehicles || [])];
      errs[index] = { ...errs[index], [field]: '' };
      setEditErrors(e => ({ ...e, vehicles: errs }));
    }
  }

  function handleAddVehicleInEdit() {
    setEditForm(f => ({
      ...f,
      vehicles: [...f.vehicles, { id: '', vehicleNumber: '', make: '', model: '', year: new Date().getFullYear(), isNew: true }]
    }));
  }

  function handleRemoveVehicle(index, vehicleId) {
    if (vehicleId && !editForm.vehicles[index].isNew) {
      setDeletedVehicleIds(ids => [...ids, vehicleId]);
    }
    setEditForm(f => ({ ...f, vehicles: f.vehicles.filter((_, i) => i !== index) }));
    if (editErrors.vehicles) {
      setEditErrors(e => ({ ...e, vehicles: e.vehicles.filter((_, i) => i !== index) }));
    }
  }

  function validateEditForm() {
    const errs = {};
    const nameParts = (editForm.fullName || '').trim().split(/\s+/);
    if (!editForm.fullName?.trim()) {
      errs.fullName = "Full name is required.";
    } else if (nameParts.length < 2) {
      errs.fullName = "Must include first and last name.";
    } else if (nameParts.some(p => !/^[a-zA-Z]+$/.test(p))) {
      errs.fullName = "Name can only contain letters.";
    } else if (nameParts[0].length < 3 || nameParts[1].length < 3) {
      errs.fullName = "First and last name must each be at least 3 letters.";
    }

    if (!editForm.phoneNumber) {
      errs.phoneNumber = "Phone number is required.";
    } else if (!/^\d{10}$/.test(editForm.phoneNumber)) {
      errs.phoneNumber = "Must be exactly 10 digits.";
    }

    if (!editForm.address?.trim() || editForm.address.trim().length < 5) {
      errs.address = "Address must be at least 5 characters.";
    }

    const vehicleErrs = [];
    let hasVehicleErr = false;
    editForm.vehicles.forEach((v, i) => {
      const vErr = {};
      if (!v.vehicleNumber?.trim() || v.vehicleNumber.trim().length < 3) {
        vErr.vehicleNumber = "At least 3 characters.";
      } else if (!/^[a-zA-Z0-9\s-]+$/.test(v.vehicleNumber)) {
        vErr.vehicleNumber = "Alphanumeric, spaces, hyphens only.";
      }
      if (!v.make?.trim() || v.make.trim().length < 2) vErr.make = "Min 2 characters.";
      if (!v.model?.trim() || v.model.trim().length < 2) vErr.model = "Min 2 characters.";
      const yr = Number(v.year);
      const now = new Date().getFullYear();
      if (!v.year) vErr.year = "Year is required.";
      else if (yr < 1886 || yr > now + 1) vErr.year = `Between 1886 and ${now + 1}.`;
      if (Object.keys(vErr).length) { vehicleErrs[i] = vErr; hasVehicleErr = true; }
    });

    return { errs, vehicleErrs, hasVehicleErr };
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    const { errs, vehicleErrs, hasVehicleErr } = validateEditForm();
    if (Object.keys(errs).length || hasVehicleErr) {
      setEditErrors({ ...errs, vehicles: vehicleErrs });
      return;
    }
    setEditErrors({});
    setSubmittingEdit(true);
    try {
      await api.put(`/Customers/${id}/profile`, {
        fullName: editForm.fullName,
        phoneNumber: editForm.phoneNumber,
        address: editForm.address
      });
      for (const vehicleId of deletedVehicleIds) {
        await api.delete(`/Customers/${id}/vehicles/${vehicleId}`);
      }
      for (const v of editForm.vehicles) {
        if (v.isNew) {
          await api.post(`/Customers/${id}/vehicles`, { vehicleNumber: v.vehicleNumber, make: v.make, model: v.model, year: v.year });
        } else {
          await api.put(`/Customers/${id}/vehicles/${v.id}`, { id: v.id, vehicleNumber: v.vehicleNumber, make: v.make, model: v.model, year: v.year });
        }
      }
      setIsEditing(false);
      showNotification('success', 'Profile and vehicle details updated successfully.');
      fetchDetails();
    } catch (err) {
      showNotification('error', 'Failed to update profile: ' + (err.message || 'Please try again.'));
    } finally {
      setSubmittingEdit(false);
    }
  }

  function validateVehicleForm() {
    const errs = {};
    if (!vehicleForm.vehicleNumber?.trim() || vehicleForm.vehicleNumber.trim().length < 3) {
      errs.vehicleNumber = "Vehicle number must be at least 3 characters.";
    } else if (!/^[a-zA-Z0-9\s-]+$/.test(vehicleForm.vehicleNumber)) {
      errs.vehicleNumber = "Alphanumeric, spaces, and hyphens only.";
    }
    if (!vehicleForm.make?.trim() || vehicleForm.make.trim().length < 2) errs.make = "Make is required (min 2 characters).";
    if (!vehicleForm.model?.trim() || vehicleForm.model.trim().length < 2) errs.model = "Model is required (min 2 characters).";
    const yr = Number(vehicleForm.year);
    const now = new Date().getFullYear();
    if (!vehicleForm.year) errs.year = "Year is required.";
    else if (yr < 1886 || yr > now + 1) errs.year = `Must be between 1886 and ${now + 1}.`;
    return errs;
  }

  async function handleAddVehicle(e) {
    e.preventDefault();
    const errs = validateVehicleForm();
    if (Object.keys(errs).length) { setVehicleErrors(errs); return; }
    setVehicleErrors({});
    setSubmittingVehicle(true);
    try {
      await api.post(`/Customers/${id}/vehicles`, vehicleForm);
      setIsAddingVehicle(false);
      setVehicleForm({ vehicleNumber: '', make: '', model: '', year: new Date().getFullYear() });
      showNotification('success', 'Vehicle registered to your account.');
      fetchDetails();
    } catch {
      showNotification('error', 'Failed to add vehicle. Please try again.');
    } finally {
      setSubmittingVehicle(false);
    }
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-500)' }}>Loading your profile...</div>;
  if (fetchError === 'auth') return (
    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--err-ink)' }}>
      You are not authorized to view this profile.
      <br />
      <Button variant="ghost" onClick={() => navigate('/login')} style={{ marginTop: '10px' }}>Go to Login</Button>
    </div>
  );
  if (fetchError === 'fetch') return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--err-ink)' }}>Could not load profile. Please try again later.</div>;
  if (!customer) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--err-ink)' }}>Profile not found.</div>;

  return (
    <div className="portal-page">
      {/* Page header */}
      <div className="portal-page-header">
        <div>
          <h1 className="portal-page-title">My Profile</h1>
          <p className="portal-page-subtitle">Welcome back, {customer.fullName}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" onClick={handleStartEdit}>Edit My Info</Button>
          <Button variant="primary" onClick={() => { setVehicleForm({ vehicleNumber: '', make: '', model: '', year: new Date().getFullYear() }); setVehicleErrors({}); setIsAddingVehicle(true); }}>Register New Vehicle</Button>
        </div>
      </div>

      {/* Notification banner */}
      {notification && (
        <div className={`portal-notification portal-notification--${notification.type}`} role="status">
          {notification.message}
        </div>
      )}

      {/* Edit My Info modal */}
      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit My Information">
        <form onSubmit={handleUpdateProfile}>
          <p style={{ fontSize: '13px', color: 'var(--ink-500)', marginTop: '-8px', marginBottom: '20px' }}>
            Update your contact details and manage registered vehicles.
          </p>

          {/* Contact Details */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-700)', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--line-soft)' }}>
              Contact Details
            </div>
            <div className="portal-form-field">
              <label>Full Name</label>
              <input type="text" className="cs-input" value={editForm.fullName} onChange={e => setEditForm(f => ({ ...f, fullName: e.target.value }))} />
              {editErrors.fullName && <span className="portal-field-error">{editErrors.fullName}</span>}
            </div>
            <div className="portal-form-field">
              <label>Phone Number</label>
              <input type="text" className="cs-input" value={editForm.phoneNumber} onChange={e => setEditForm(f => ({ ...f, phoneNumber: e.target.value }))} />
              {editErrors.phoneNumber && <span className="portal-field-error">{editErrors.phoneNumber}</span>}
            </div>
            <div className="portal-form-field">
              <label>Address</label>
              <input type="text" className="cs-input" value={editForm.address} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} />
              {editErrors.address && <span className="portal-field-error">{editErrors.address}</span>}
            </div>
          </div>

          {/* Vehicles */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--line-soft)' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-700)' }}>My Vehicles</div>
              <Button variant="secondary" size="sm" type="button" onClick={handleAddVehicleInEdit}>+ Add Vehicle</Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
              {editForm.vehicles.length > 0 ? editForm.vehicles.map((v, i) => {
                const vErr = editErrors.vehicles?.[i] || {};
                return (
                  <div key={i} style={{ padding: '12px', border: '1px solid var(--line-soft)', borderRadius: '8px', backgroundColor: 'var(--bg-sunk)', position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveVehicle(i, v.id)}
                      style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--err-ink)', fontSize: '14px', lineHeight: 1, padding: '2px 4px' }}
                      title="Remove vehicle"
                    >✕</button>

                    <div className="portal-form-field" style={{ marginBottom: '8px' }}>
                      <label>Vehicle Number</label>
                      <input type="text" className="cs-input" value={v.vehicleNumber} onChange={e => handleVehicleChange(i, 'vehicleNumber', e.target.value)} placeholder="e.g. BA 2 PA 1234" />
                      {vErr.vehicleNumber && <span className="portal-field-error">{vErr.vehicleNumber}</span>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div className="portal-form-field" style={{ marginBottom: 0 }}>
                        <label>Make</label>
                        <input type="text" className="cs-input" value={v.make} onChange={e => handleVehicleChange(i, 'make', e.target.value)} placeholder="Toyota" />
                        {vErr.make && <span className="portal-field-error">{vErr.make}</span>}
                      </div>
                      <div className="portal-form-field" style={{ marginBottom: 0 }}>
                        <label>Model</label>
                        <input type="text" className="cs-input" value={v.model} onChange={e => handleVehicleChange(i, 'model', e.target.value)} placeholder="Corolla" />
                        {vErr.model && <span className="portal-field-error">{vErr.model}</span>}
                      </div>
                    </div>

                    <div className="portal-form-field" style={{ marginTop: '8px', marginBottom: 0 }}>
                      <label>Year</label>
                      <input type="number" className="cs-input" value={v.year} onChange={e => handleVehicleChange(i, 'year', parseInt(e.target.value) || new Date().getFullYear())} placeholder="2022" />
                      {vErr.year && <span className="portal-field-error">{vErr.year}</span>}
                    </div>
                  </div>
                );
              }) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--ink-400)', fontSize: '13px', border: '1px dashed var(--line)', borderRadius: '8px' }}>
                  No vehicles registered. Click "+ Add Vehicle" to add one.
                </div>
              )}
            </div>
          </div>

          <div className="portal-form-actions">
            <Button variant="ghost" type="button" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={submittingEdit}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Register New Vehicle modal */}
      <Modal isOpen={isAddingVehicle} onClose={() => setIsAddingVehicle(false)} title="Register New Vehicle">
        <form onSubmit={handleAddVehicle}>
          <div className="portal-form-field">
            <label>Vehicle Number</label>
            <input type="text" className="cs-input" placeholder="e.g. BA 2 PA 1234" value={vehicleForm.vehicleNumber} onChange={e => setVehicleForm(f => ({ ...f, vehicleNumber: e.target.value }))} />
            {vehicleErrors.vehicleNumber && <span className="portal-field-error">{vehicleErrors.vehicleNumber}</span>}
          </div>
          <div className="portal-form-field">
            <label>Make</label>
            <input type="text" className="cs-input" placeholder="e.g. Toyota" value={vehicleForm.make} onChange={e => setVehicleForm(f => ({ ...f, make: e.target.value }))} />
            {vehicleErrors.make && <span className="portal-field-error">{vehicleErrors.make}</span>}
          </div>
          <div className="portal-form-field">
            <label>Model</label>
            <input type="text" className="cs-input" placeholder="e.g. Corolla" value={vehicleForm.model} onChange={e => setVehicleForm(f => ({ ...f, model: e.target.value }))} />
            {vehicleErrors.model && <span className="portal-field-error">{vehicleErrors.model}</span>}
          </div>
          <div className="portal-form-field">
            <label>Year</label>
            <input type="number" className="cs-input" placeholder="e.g. 2022" value={vehicleForm.year} onChange={e => setVehicleForm(f => ({ ...f, year: parseInt(e.target.value) || new Date().getFullYear() }))} />
            {vehicleErrors.year && <span className="portal-field-error">{vehicleErrors.year}</span>}
          </div>
          <div className="portal-form-actions">
            <Button variant="ghost" type="button" onClick={() => setIsAddingVehicle(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={submittingVehicle}>Add Vehicle</Button>
          </div>
        </form>
      </Modal>

      {/* Profile info cards */}
      <div className="portal-profile-grid">
        <div className="portal-info-card">
          <div className="portal-info-card__header">
            <h2 className="portal-info-card__title">My Account Info</h2>
          </div>
          <div className="portal-info-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div className="cs-helper">Email Address</div>
              <div style={{ fontSize: '15px', color: 'var(--ink-900)', marginTop: '4px' }}>{customer.email}</div>
            </div>
            <div>
              <div className="cs-helper">Primary Phone</div>
              <div style={{ fontSize: '15px', color: 'var(--ink-900)', marginTop: '4px' }}>{customer.phoneNumber || '—'}</div>
            </div>
            <div>
              <div className="cs-helper">Address</div>
              <div style={{ fontSize: '15px', color: 'var(--ink-900)', marginTop: '4px' }}>{customer.address || '—'}</div>
            </div>
            <div>
              <div className="cs-helper">Member Since</div>
              <div style={{ fontSize: '15px', color: 'var(--ink-900)', marginTop: '4px' }}>
                {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'}
              </div>
            </div>
          </div>
        </div>

        <div className="portal-info-card">
          <div className="portal-info-card__header">
            <h2 className="portal-info-card__title">My Registered Vehicles</h2>
            <span style={{ fontSize: '12px', color: 'var(--ink-400)', fontWeight: 500 }}>
              {customer.vehicles?.length ?? 0} vehicle{customer.vehicles?.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="portal-info-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {customer.vehicles && customer.vehicles.length > 0 ? customer.vehicles.map(v => (
              <div key={v.id} style={{ padding: '14px 16px', border: '1px solid var(--line-soft)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-sunk)' }}>
                <div>
                  <div className="cs-mono" style={{ fontWeight: 700, fontSize: '15px', color: 'var(--ink-900)' }}>{v.vehicleNumber}</div>
                  <div className="cs-muted" style={{ marginTop: '2px' }}>{v.year} {v.make} {v.model}</div>
                </div>
                <span className="status-badge status-badge--success">Active</span>
              </div>
            )) : (
              <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--ink-400)', fontSize: '14px' }}>
                No vehicles registered yet.
                <br />
                <span style={{ fontSize: '13px' }}>Click "Register New Vehicle" above to add one.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;

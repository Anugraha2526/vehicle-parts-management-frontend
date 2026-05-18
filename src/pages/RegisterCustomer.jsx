import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const RegisterCustomer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    vehicleNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear()
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { ...formData, role: 'Customer' });
      alert('Customer registered successfully');
      navigate('/customers');
    } catch (error) {
      alert('Failed to register customer');
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title" style={{ fontSize: '28px', fontWeight: 700 }}>Register Customer</h1>
        <p style={{ color: 'var(--ink-500)', marginTop: '4px' }}>Add a new customer and their primary vehicle.</p>
      </div>

      <form onSubmit={handleSubmit} className="cs-card cs-form" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '18px', fontFamily: 'Fraunces, serif', fontWeight: 600, marginBottom: '20px', borderBottom: '1px solid var(--line-soft)', paddingBottom: '12px' }}>Personal Details</h2>
        <div className="cs-form-grid">
          <div className="cs-field">
            <label>Full Name</label>
            <input type="text" name="fullName" className="cs-input" required onChange={handleChange} />
          </div>
          <div className="cs-field">
            <label>Phone Number</label>
            <input type="text" name="phoneNumber" className="cs-input" required onChange={handleChange} />
          </div>
          <div className="cs-field">
            <label>Email Address</label>
            <input type="email" name="email" className="cs-input" required onChange={handleChange} />
          </div>
          <div className="cs-field">
            <label>Address</label>
            <input type="text" name="address" className="cs-input" required onChange={handleChange} />
          </div>
          <div className="cs-field">
            <label>Initial Password</label>
            <input type="password" name="password" className="cs-input" required onChange={handleChange} />
          </div>
        </div>

        <h2 style={{ fontSize: '18px', fontFamily: 'Fraunces, serif', fontWeight: 600, marginTop: '32px', marginBottom: '20px', borderBottom: '1px solid var(--line-soft)', paddingBottom: '12px' }}>Vehicle Details</h2>
        <div className="cs-form-grid">
          <div className="cs-field">
            <label>Vehicle Number</label>
            <input type="text" name="vehicleNumber" className="cs-input" placeholder="e.g. BA-1-PA-1234" required onChange={handleChange} />
          </div>
          <div className="cs-field">
            <label>Company</label>
            <input type="text" name="make" className="cs-input" placeholder="e.g. Honda" required onChange={handleChange} />
          </div>
          <div className="cs-field">
            <label>Model</label>
            <input type="text" name="model" className="cs-input" required onChange={handleChange} />
          </div>
          <div className="cs-field">
            <label>Year</label>
            <input type="number" name="year" className="cs-input" defaultValue={2024} required onChange={handleChange} />
          </div>
        </div>

        <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate('/customers')} className="cs-button cs-button--ghost">Cancel</button>
          <button type="submit" className="cs-button cs-button--primary">Register Customer</button>
        </div>
      </form>
    </div>
  );
};

export default RegisterCustomer;

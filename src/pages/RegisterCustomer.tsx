import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const RegisterCustomer: React.FC = () => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/Customers', formData);
      alert('Customer registered successfully!');
      navigate('/customers');
    } catch (error) {
      console.error('Error registering customer:', error);
      alert('Failed to register customer.');
    }
  };

  return (
    <div className="register-customer">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Register New Customer</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Fill in the details to register a new customer and their vehicle.</p>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Customer Information</h2>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" name="fullName" className="form-input" required onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" name="email" className="form-input" required onChange={handleChange} />
          </div>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="text" name="phoneNumber" className="form-input" required onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Initial Password</label>
            <input type="password" name="password" className="form-input" placeholder="For customer login" onChange={handleChange} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <input type="text" name="address" className="form-input" required onChange={handleChange} />
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: 600, marginTop: '20px', marginBottom: '20px' }}>Vehicle Details</h2>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Vehicle Number (License Plate)</label>
            <input type="text" name="vehicleNumber" className="form-input" required onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Make</label>
            <input type="text" name="make" className="form-input" placeholder="e.g. Toyota" required onChange={handleChange} />
          </div>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Model</label>
            <input type="text" name="model" className="form-input" placeholder="e.g. Corolla" required onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Year</label>
            <input type="number" name="year" className="form-input" defaultValue={2024} required onChange={handleChange} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button type="submit" className="btn btn-primary">Register Customer</button>
          <button type="button" onClick={() => navigate('/customers')} className="btn btn-outline">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default RegisterCustomer;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

const PublicRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '', email: '', phoneNumber: '', address: '', password: '',
    vehicleNumber: '', make: '', model: '', year: new Date().getFullYear()
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { ...formData, role: 'Customer' });
      alert('Account created successfully! Please login.');
      navigate('/login');
    } catch (error) {
      alert('Registration failed. Email might already be in use.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)', padding: '40px 20px' }}>
      <div className="cs-card" style={{ width: '100%', maxWidth: '640px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '50px', height: '50px', backgroundColor: 'var(--accent)', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 700, margin: '0 auto 16px' }}>C</div>
            <h1 className="page-title" style={{ fontSize: '28px', fontWeight: 700 }}>Join ChitoSpare</h1>
            <p style={{ color: 'var(--ink-500)', marginTop: '8px' }}>Create your account to manage your vehicles and service history.</p>
        </div>

        <form onSubmit={handleSubmit} className="cs-form">
          <h2 style={{ fontSize: '18px', fontFamily: 'Fraunces, serif', fontWeight: 600, marginTop: '16px', marginBottom: '16px', borderBottom: '1px solid var(--line-soft)', paddingBottom: '12px' }}>Personal Details</h2>
          <div className="cs-form-grid">
            <div className="cs-field">
              <label>Full Name</label>
              <input type="text" name="fullName" className="cs-input" required onChange={handleChange} />
            </div>
            <div className="cs-field">
              <label>Email Address</label>
              <input type="email" name="email" className="cs-input" required onChange={handleChange} />
            </div>
          </div>
          <div className="cs-form-grid" style={{ marginTop: '16px' }}>
            <div className="cs-field">
              <label>Phone Number</label>
              <input type="text" name="phoneNumber" className="cs-input" required onChange={handleChange} />
            </div>
            <div className="cs-field">
              <label>Password</label>
              <input type="password" name="password" className="cs-input" required onChange={handleChange} />
            </div>
          </div>
          <div className="cs-field" style={{ marginTop: '16px' }}>
            <label>Residential Address</label>
            <input type="text" name="address" className="cs-input" required onChange={handleChange} />
          </div>

          <h2 style={{ fontSize: '18px', fontFamily: 'Fraunces, serif', fontWeight: 600, marginTop: '32px', marginBottom: '16px', borderBottom: '1px solid var(--line-soft)', paddingBottom: '12px' }}>Primary Vehicle Details</h2>
          <div className="cs-form-grid">
            <div className="cs-field">
              <label>Vehicle Number</label>
              <input type="text" name="vehicleNumber" className="cs-input" placeholder="e.g. BA-1-PA-1234" required onChange={handleChange} />
            </div>
            <div className="cs-field">
              <label>Make</label>
              <input type="text" name="make" className="cs-input" placeholder="e.g. Honda" required onChange={handleChange} />
            </div>
          </div>
          <div className="cs-form-grid" style={{ marginTop: '16px' }}>
            <div className="cs-field">
              <label>Model</label>
              <input type="text" name="model" className="cs-input" placeholder="e.g. Civic" required onChange={handleChange} />
            </div>
            <div className="cs-field">
              <label>Year</label>
              <input type="number" name="year" className="cs-input" defaultValue={2024} required onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="cs-button cs-button--primary" style={{ width: '100%', marginTop: '32px', padding: '14px' }}>Create My Account</button>
          
          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--ink-500)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default PublicRegister;

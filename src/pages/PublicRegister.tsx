import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

const PublicRegister: React.FC = () => {
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
      await api.post('/auth/register', formData);
      alert('Account created successfully! Please login.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Email might already be in use.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FCFAF8', padding: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '50px', height: '50px', backgroundColor: 'var(--primary)', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, margin: '0 auto 16px' }}>C</div>
            <h1 style={{ fontSize: '28px', fontWeight: 700 }}>Join ChitoSpare</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Create your account to manage your vehicles and service history.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Personal Details</h2>
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
              <label className="form-label">Password</label>
              <input type="password" name="password" className="form-input" required onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Residential Address</label>
            <input type="text" name="address" className="form-input" required onChange={handleChange} />
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: 600, marginTop: '24px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Primary Vehicle Details</h2>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Vehicle Number</label>
              <input type="text" name="vehicleNumber" className="form-input" placeholder="e.g. BA-1-PA-1234" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Make</label>
              <input type="text" name="make" className="form-input" placeholder="e.g. Honda" required onChange={handleChange} />
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Model</label>
              <input type="text" name="model" className="form-input" placeholder="e.g. Civic" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Year</label>
              <input type="number" name="year" className="form-input" defaultValue={2024} required onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '20px', padding: '14px' }}>Create My Account</button>
          
          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default PublicRegister;

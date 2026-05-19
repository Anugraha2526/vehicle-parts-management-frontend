import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

const PublicRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '', email: '', phoneNumber: '', address: '', password: '',
    vehicleNumber: '', make: '', model: '', year: 2024
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const tempErrors = {};
    
    // Full Name
    const nameParts = (formData.fullName || '').trim().split(/\s+/);
    if (!formData.fullName || formData.fullName.trim() === '') {
      tempErrors.fullName = "Full Name is required.";
    } else if (nameParts.length < 2) {
      tempErrors.fullName = "Full Name must contain at least two words (First and Last Name).";
    } else if (nameParts.some(part => !/^[a-zA-Z]+$/.test(part))) {
      tempErrors.fullName = "Full Name can only contain letters.";
    } else if (nameParts[0].length < 3 || nameParts[1].length < 3) {
      tempErrors.fullName = "Both First and Last Name must be at least 3 letters long.";
    }
    
    // Email
    if (!formData.email) {
      tempErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Email address is invalid.";
    }
    
    // Phone Number
    if (!formData.phoneNumber) {
      tempErrors.phoneNumber = "Phone Number is required.";
    } else if (!/^\d+$/.test(formData.phoneNumber)) {
      tempErrors.phoneNumber = "Phone Number must contain only numeric digits.";
    } else if (formData.phoneNumber.length !== 10) {
      tempErrors.phoneNumber = "Phone Number must be exactly 10 digits.";
    }
    
    // Password
    if (!formData.password) {
      tempErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters.";
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      tempErrors.password = "Password must contain at least one lowercase letter.";
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      tempErrors.password = "Password must contain at least one uppercase letter.";
    } else if (!/(?=.*\d)/.test(formData.password)) {
      tempErrors.password = "Password must contain at least one number.";
    } else if (!/(?=.*[@$!%*?&#])/.test(formData.password)) {
      tempErrors.password = "Password must contain at least one special character (e.g. @, $, !, %, *, ?, &, #).";
    }
    
    // Address
    if (!formData.address || formData.address.trim().length < 5) {
      tempErrors.address = "Address must be at least 5 characters.";
    }
    
    // Vehicle Number
    if (!formData.vehicleNumber || formData.vehicleNumber.trim().length < 3) {
      tempErrors.vehicleNumber = "Vehicle number must be at least 3 characters.";
    } else if (!/^[a-zA-Z0-9\s-]+$/.test(formData.vehicleNumber)) {
      tempErrors.vehicleNumber = "Invalid format. Only alphanumeric characters, spaces, and hyphens.";
    }
    
    // Make
    if (!formData.make || formData.make.trim().length < 2) {
      tempErrors.make = "Make/Company is required (min 2 chars).";
    }
    
    // Model
    if (!formData.model || formData.model.trim().length < 2) {
      tempErrors.model = "Model is required (min 2 chars).";
    }
    
    // Year
    const currentYear = new Date().getFullYear();
    if (!formData.year) {
      tempErrors.year = "Year is required.";
    } else if (!/^\d+$/.test(formData.year.toString())) {
      tempErrors.year = "Year must contain only digits.";
    } else if (formData.year < 1886 || formData.year > currentYear + 1) {
      tempErrors.year = `Year must be between 1886 and ${currentYear + 1}.`;
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await api.post('/auth/register', { ...formData, role: 'Customer' });
      alert('Account created successfully! Please login.');
      navigate('/login');
    } catch (error) {
      alert(error.message || 'Registration failed. Email or phone number might already be in use.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)', padding: '40px 20px' }}>
      <div className="cs-card" style={{ width: '100%', maxWidth: '640px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 className="page-title" style={{ fontSize: '28px', fontWeight: 600, fontFamily: 'Fraunces, serif', color: 'var(--ink-900)' }}>Join ChitoSpare</h1>
            <p style={{ color: 'var(--ink-500)', marginTop: '8px', fontSize: '14px' }}>Create your account to manage your vehicles and service history.</p>
        </div>

        <form onSubmit={handleSubmit} className="cs-form">
          <h2 style={{ fontSize: '18px', fontFamily: 'Fraunces, serif', fontWeight: 600, marginTop: '16px', marginBottom: '16px', borderBottom: '1px solid var(--line-soft)', paddingBottom: '12px' }}>Personal Details</h2>
          <div className="cs-form-grid">
            <div className="cs-field">
              <label>Full Name</label>
              <input type="text" name="fullName" className="cs-input" style={{ borderColor: errors.fullName ? 'var(--err)' : 'var(--line)' }} required onChange={handleChange} />
              {errors.fullName && <span style={{ color: 'var(--err)', fontSize: '12px', marginTop: '2px' }}>⚠️ {errors.fullName}</span>}
            </div>
            <div className="cs-field">
              <label>Email Address</label>
              <input type="email" name="email" className="cs-input" style={{ borderColor: errors.email ? 'var(--err)' : 'var(--line)' }} required onChange={handleChange} />
              {errors.email && <span style={{ color: 'var(--err)', fontSize: '12px', marginTop: '2px' }}>⚠️ {errors.email}</span>}
            </div>
          </div>
          <div className="cs-form-grid" style={{ marginTop: '16px' }}>
            <div className="cs-field">
              <label>Phone Number</label>
              <input type="text" name="phoneNumber" className="cs-input" style={{ borderColor: errors.phoneNumber ? 'var(--err)' : 'var(--line)' }} required onChange={handleChange} />
              {errors.phoneNumber && <span style={{ color: 'var(--err)', fontSize: '12px', marginTop: '2px' }}>⚠️ {errors.phoneNumber}</span>}
            </div>
            <div className="cs-field">
              <label>Password</label>
              <input type="password" name="password" className="cs-input" style={{ borderColor: errors.password ? 'var(--err)' : 'var(--line)' }} required onChange={handleChange} />
              {errors.password && <span style={{ color: 'var(--err)', fontSize: '12px', marginTop: '2px' }}>⚠️ {errors.password}</span>}
            </div>
          </div>
          <div className="cs-field" style={{ marginTop: '16px' }}>
            <label>Residential Address</label>
            <input type="text" name="address" className="cs-input" style={{ borderColor: errors.address ? 'var(--err)' : 'var(--line)' }} required onChange={handleChange} />
            {errors.address && <span style={{ color: 'var(--err)', fontSize: '12px', marginTop: '2px' }}>⚠️ {errors.address}</span>}
          </div>

          <h2 style={{ fontSize: '18px', fontFamily: 'Fraunces, serif', fontWeight: 600, marginTop: '32px', marginBottom: '16px', borderBottom: '1px solid var(--line-soft)', paddingBottom: '12px' }}>Primary Vehicle Details</h2>
          <div className="cs-form-grid">
            <div className="cs-field">
              <label>Vehicle Number</label>
              <input type="text" name="vehicleNumber" className="cs-input" placeholder="e.g. BA-1-PA-1234" style={{ borderColor: errors.vehicleNumber ? 'var(--err)' : 'var(--line)' }} required onChange={handleChange} />
              {errors.vehicleNumber && <span style={{ color: 'var(--err)', fontSize: '12px', marginTop: '2px' }}>⚠️ {errors.vehicleNumber}</span>}
            </div>
            <div className="cs-field">
              <label>Make</label>
              <input type="text" name="make" className="cs-input" placeholder="e.g. Honda" style={{ borderColor: errors.make ? 'var(--err)' : 'var(--line)' }} required onChange={handleChange} />
              {errors.make && <span style={{ color: 'var(--err)', fontSize: '12px', marginTop: '2px' }}>⚠️ {errors.make}</span>}
            </div>
          </div>
          <div className="cs-form-grid" style={{ marginTop: '16px' }}>
            <div className="cs-field">
              <label>Model</label>
              <input type="text" name="model" className="cs-input" placeholder="e.g. Civic" style={{ borderColor: errors.model ? 'var(--err)' : 'var(--line)' }} required onChange={handleChange} />
              {errors.model && <span style={{ color: 'var(--err)', fontSize: '12px', marginTop: '2px' }}>⚠️ {errors.model}</span>}
            </div>
            <div className="cs-field">
              <label>Year</label>
              <input type="number" name="year" className="cs-input" defaultValue={2024} style={{ borderColor: errors.year ? 'var(--err)' : 'var(--line)' }} required onChange={handleChange} />
              {errors.year && <span style={{ color: 'var(--err)', fontSize: '12px', marginTop: '2px' }}>⚠️ {errors.year}</span>}
            </div>
          </div>

          <button type="submit" className="cs-button cs-button--primary" style={{ width: '100%', marginTop: '32px', padding: '10px 16px' }}>Create My Account</button>
          
          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--ink-500)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default PublicRegister;

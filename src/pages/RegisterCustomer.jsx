import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import '../features/admin-core/pages/VendorPage.css';
import '../features/admin-core/components/VendorForm.css';

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
    year: 2024
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
      tempErrors.password = "Initial Password is required.";
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
      tempErrors.make = "Company/Make is required (min 2 chars).";
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
      alert('Customer registered successfully');
      navigate('/staff/customers');
    } catch (error) {
      alert(error.message || 'Failed to register customer');
    }
  };

  return (
    <div className="vendor-page" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="vendor-page-header">
        <div>
          <h1 className="vendor-page-title">Register Customer</h1>
          <p className="vendor-page-subtitle">Add a new customer and their primary vehicle.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="vendor-form" noValidate>
        <h2 style={{ fontSize: '18px', fontFamily: 'Fraunces, serif', fontWeight: 600, marginBottom: '20px', borderBottom: '1px solid var(--line-soft)', paddingBottom: '12px' }}>Personal Details</h2>
        <div className="vendor-form-fields">
          <Input label="Full Name" name="fullName" value={formData.fullName} style={{ borderColor: errors.fullName ? 'var(--err)' : 'var(--line)' }} required onChange={handleChange} />
          {errors.fullName && <span style={{ color: 'var(--err)', fontSize: '12px', marginTop: '2px' }}>⚠️ {errors.fullName}</span>}
          <Input label="Phone Number" name="phoneNumber" value={formData.phoneNumber} style={{ borderColor: errors.phoneNumber ? 'var(--err)' : 'var(--line)' }} required onChange={handleChange} />
          {errors.phoneNumber && <span style={{ color: 'var(--err)', fontSize: '12px', marginTop: '2px' }}>⚠️ {errors.phoneNumber}</span>}
          <Input label="Email Address" type="email" name="email" value={formData.email} style={{ borderColor: errors.email ? 'var(--err)' : 'var(--line)' }} required onChange={handleChange} />
          {errors.email && <span style={{ color: 'var(--err)', fontSize: '12px', marginTop: '2px' }}>⚠️ {errors.email}</span>}
          <Input label="Address" name="address" value={formData.address} style={{ borderColor: errors.address ? 'var(--err)' : 'var(--line)' }} required onChange={handleChange} />
          {errors.address && <span style={{ color: 'var(--err)', fontSize: '12px', marginTop: '2px' }}>⚠️ {errors.address}</span>}
          <Input label="Initial Password" type="password" name="password" value={formData.password} style={{ borderColor: errors.password ? 'var(--err)' : 'var(--line)' }} required onChange={handleChange} />
          {errors.password && <span style={{ color: 'var(--err)', fontSize: '12px', marginTop: '2px' }}>⚠️ {errors.password}</span>}
        </div>

        <h2 style={{ fontSize: '18px', fontFamily: 'Fraunces, serif', fontWeight: 600, marginTop: '32px', marginBottom: '20px', borderBottom: '1px solid var(--line-soft)', paddingBottom: '12px' }}>Vehicle Details</h2>
        <div className="vendor-form-fields">
          <Input label="Vehicle Number" name="vehicleNumber" placeholder="e.g. BA-1-PA-1234" value={formData.vehicleNumber} style={{ borderColor: errors.vehicleNumber ? 'var(--err)' : 'var(--line)' }} required onChange={handleChange} />
          {errors.vehicleNumber && <span style={{ color: 'var(--err)', fontSize: '12px', marginTop: '2px' }}>⚠️ {errors.vehicleNumber}</span>}
          <Input label="Company" name="make" placeholder="e.g. Honda" value={formData.make} style={{ borderColor: errors.make ? 'var(--err)' : 'var(--line)' }} required onChange={handleChange} />
          {errors.make && <span style={{ color: 'var(--err)', fontSize: '12px', marginTop: '2px' }}>⚠️ {errors.make}</span>}
          <Input label="Model" name="model" value={formData.model} style={{ borderColor: errors.model ? 'var(--err)' : 'var(--line)' }} required onChange={handleChange} />
          {errors.model && <span style={{ color: 'var(--err)', fontSize: '12px', marginTop: '2px' }}>⚠️ {errors.model}</span>}
          <Input label="Year" type="number" name="year" value={formData.year} style={{ borderColor: errors.year ? 'var(--err)' : 'var(--line)' }} required onChange={handleChange} />
          {errors.year && <span style={{ color: 'var(--err)', fontSize: '12px', marginTop: '2px' }}>⚠️ {errors.year}</span>}
        </div>

        <div className="vendor-form-actions" style={{ marginTop: '32px' }}>
          <Button type="button" variant="secondary" onClick={() => navigate('/staff/customers')}>Cancel</Button>
          <Button type="submit" variant="primary">Register Customer</Button>
        </div>
      </form>
    </div>
  );
};

export default RegisterCustomer;

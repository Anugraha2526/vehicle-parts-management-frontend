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
          <Input label="Full Name" name="fullName" value={formData.fullName} required onChange={handleChange} />
          <Input label="Phone Number" name="phoneNumber" value={formData.phoneNumber} required onChange={handleChange} />
          <Input label="Email Address" type="email" name="email" value={formData.email} required onChange={handleChange} />
          <Input label="Address" name="address" value={formData.address} required onChange={handleChange} />
          <Input label="Initial Password" type="password" name="password" value={formData.password} required onChange={handleChange} />
        </div>

        <h2 style={{ fontSize: '18px', fontFamily: 'Fraunces, serif', fontWeight: 600, marginTop: '32px', marginBottom: '20px', borderBottom: '1px solid var(--line-soft)', paddingBottom: '12px' }}>Vehicle Details</h2>
        <div className="vendor-form-fields">
          <Input label="Vehicle Number" name="vehicleNumber" placeholder="e.g. BA-1-PA-1234" value={formData.vehicleNumber} required onChange={handleChange} />
          <Input label="Company" name="make" placeholder="e.g. Honda" value={formData.make} required onChange={handleChange} />
          <Input label="Model" name="model" value={formData.model} required onChange={handleChange} />
          <Input label="Year" type="number" name="year" value={formData.year} required onChange={handleChange} />
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

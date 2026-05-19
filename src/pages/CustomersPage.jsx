import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import '../features/admin-core/pages/VendorPage.css';

const CustomersPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCustomers = async (query = '') => {
    setLoading(true);
    try {
      const endpoint = query ? `/Customers/search?query=${encodeURIComponent(query)}` : '/Customers/all';
      const data = await api.get(endpoint);
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCustomers(searchQuery);
  };

  const columns = useMemo(() => [
    {
      key: "name",
      label: "CUSTOMER NAME",
      render: (_, customer) => (
        <>
          <div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{customer.fullName}</div>
          <div className="cs-muted" style={{ fontSize: '12px', color: 'var(--ink-500)' }}>ID: {customer.id}</div>
        </>
      )
    },
    {
      key: "contact",
      label: "CONTACT INFORMATION",
      render: (_, customer) => (
        <>
          <div style={{ color: 'var(--ink-900)' }}>{customer.phoneNumber}</div>
          <div className="cs-muted" style={{ fontSize: '13px', color: 'var(--ink-500)' }}>{customer.email}</div>
        </>
      )
    },
    {
      key: "vehicles",
      label: "VEHICLES",
      render: (_, customer) => (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
           {customer.vehicles.map(v => (
             <span key={v.id} style={{
               background: 'var(--blue-50)', color: 'var(--blue-700)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace'
             }}>
               {v.vehicleNumber}
             </span>
           ))}
        </div>
      )
    },
    {
      key: "action",
      label: "ACTION",
      render: (_, customer) => (
        <Button variant="secondary" size="sm" onClick={() => navigate(`/staff/customers/${customer.id}`)}>
          View Details
        </Button>
      )
    }
  ], [navigate]);

  return (
    <div className="vendor-page">
      <div className="vendor-page-header">
        <div>
          <h1 className="vendor-page-title">Customer Management</h1>
          <p className="vendor-page-subtitle">Manage your customer base and their vehicles.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/staff/customers/register')}>
          + Register New Customer
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '8px' }}>
        <form onSubmit={handleSearch} style={{ flex: 1 }}>
          <Input 
            name="search"
            placeholder="Search by name, phone, ID or license plate..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        <Button variant="secondary" onClick={() => fetchCustomers(searchQuery)}>
          Search
        </Button>
      </div>

      <Table 
        columns={columns} 
        data={customers} 
        loading={loading} 
        emptyMessage="No customers found." 
      />
    </div>
  );
};

export default CustomersPage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const CustomersPage = () => {
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

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '28px', fontWeight: 700 }}>Customers</h1>
          <p style={{ color: 'var(--ink-500)', marginTop: '4px' }}>Manage your customer base and their vehicles.</p>
        </div>
        <Link to="/register-customer" className="cs-button cs-button--primary">
          + Register New Customer
        </Link>
      </div>

      <div className="cs-card" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
          <form onSubmit={handleSearch} style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-500)' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search by name, phone, ID or license plate..." 
              className="cs-input" 
              style={{ paddingLeft: '40px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <button onClick={() => fetchCustomers(searchQuery)} className="cs-button cs-button--secondary">Search</button>
        </div>

        <div className="cs-table-wrapper">
          <table className="cs-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Contact Information</th>
                <th>Vehicles</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-500)' }}>Loading customers...</td></tr>
              ) : customers.length > 0 ? (
                customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{customer.fullName}</div>
                      <div className="cs-muted">ID: {customer.id}</div>
                    </td>
                    <td>
                      <div>{customer.phoneNumber}</div>
                      <div className="cs-muted">{customer.email}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {customer.vehicles.map(v => (
                          <span key={v.id} className="cs-mono status-badge status-badge--info">
                            {v.vehicleNumber}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <Link to={`/customers/${customer.id}`} className="cs-button cs-button--ghost">View Details</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-500)' }}>No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;

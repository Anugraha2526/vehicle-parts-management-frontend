import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

interface Customer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  vehicles: any[];
}

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(searchQuery);
  };

  return (
    <div className="customers-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Customers</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Manage your customer base and their vehicles.</p>
        </div>
        <Link to="/register-customer" className="btn btn-primary">
          <span>+</span> Register New Customer
        </Link>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
          <form onSubmit={handleSearch} style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search by name, phone, ID or license plate..." 
              className="form-input" 
              style={{ paddingLeft: '36px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <button onClick={() => fetchCustomers(searchQuery)} className="btn btn-outline">Search</button>
        </div>

        <div className="table-container">
          <table>
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
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>Loading customers...</td></tr>
              ) : customers.length > 0 ? (
                customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{customer.fullName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ID: {customer.id}</div>
                    </td>
                    <td>
                      <div>{customer.phoneNumber}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{customer.email}</div>
                    </td>
                    <td>
                      {customer.vehicles.map(v => (
                        <span key={v.id} style={{ display: 'inline-block', padding: '2px 8px', backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '12px', marginRight: '4px' }}>
                          {v.vehicleNumber}
                        </span>
                      ))}
                    </td>
                    <td>
                      <Link to={`/customers/${customer.id}`} style={{ color: 'var(--primary)', fontWeight: 500 }}>View Details</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;

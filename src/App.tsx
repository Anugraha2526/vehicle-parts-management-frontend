import { Routes, Route } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import CustomersPage from './pages/CustomersPage';
import RegisterCustomer from './pages/RegisterCustomer';
import CustomerDetails from './pages/CustomerDetails';
import Login from './pages/Login';
import PublicRegister from './pages/PublicRegister';
import CustomerProfile from './pages/CustomerProfile';
import { api } from './services/api';

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/Reports/summary');
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: '24px', fontSize: '28px', fontWeight: 700 }}>Welcome back, Aarav</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Saturday, 25 April 2026 — here's what's happening in the shop today.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <div className="card">
          <div className="card-title">👥 Total Customers</div>
          <div className="card-value">{stats?.totalCustomers || 0}</div>
        </div>
        <div className="card">
          <div className="card-title">🚗 Total Vehicles</div>
          <div className="card-value">{stats?.totalVehicles || 0}</div>
        </div>
        <div className="card">
          <div className="card-title">✨ Registered Today</div>
          <div className="card-value">{stats?.registeredToday || 0}</div>
        </div>
        <div className="card">
          <div className="card-title">📜 Service History</div>
          <div className="card-value">{stats?.totalTransactions || 0}</div>
        </div>
      </div>

    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* Public Routes for Feature 12 */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<PublicRegister />} />
      <Route path="/my-profile/:id" element={<CustomerProfile />} />

      {/* Staff/Admin Routes for Features 6, 8, 10 */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:id" element={<CustomerDetails />} />
        <Route path="register-customer" element={<RegisterCustomer />} />
        <Route path="*" element={<div>Page under construction</div>} />
      </Route>
    </Routes>
  );
}

export default App;

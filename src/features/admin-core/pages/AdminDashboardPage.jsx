import { useState, useEffect } from "react";
import { api } from "../../../services/api";
import "./AdminDashboard.css";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);

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
    <div className="admin-dashboard" style={{ padding: '24px' }}>
      <div className="admin-dashboard-header">
        <h1 className="admin-dashboard-title" style={{ marginBottom: '8px', fontSize: '28px', fontWeight: 700 }}>Welcome back, Aarav</h1>
        <p className="admin-dashboard-subtitle" style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
          Saturday, 25 April 2026 — here's what's happening in the shop today.
        </p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div className="admin-dashboard-card" style={{ padding: '20px', backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div className="admin-dashboard-card-label" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>👥 Total Customers</div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '8px' }}>{stats?.totalCustomers || 0}</div>
        </div>
        <div className="admin-dashboard-card" style={{ padding: '20px', backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div className="admin-dashboard-card-label" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>🚗 Total Vehicles</div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '8px' }}>{stats?.totalVehicles || 0}</div>
        </div>
        <div className="admin-dashboard-card" style={{ padding: '20px', backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div className="admin-dashboard-card-label" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>✨ Registered Today</div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '8px' }}>{stats?.registeredToday || 0}</div>
        </div>
        <div className="admin-dashboard-card" style={{ padding: '20px', backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div className="admin-dashboard-card-label" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>📜 Service History</div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '8px' }}>{stats?.totalTransactions || 0}</div>
        </div>
      </div>
    </div>
  );
}

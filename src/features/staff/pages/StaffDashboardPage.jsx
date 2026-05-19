import { useState, useEffect } from "react";
import { api } from "../../../services/api";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import "../../admin-core/pages/AdminDashboard.css"; // Reuse existing css

export default function StaffDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/StaffDashboard/stats');
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h1 className="admin-dashboard-title">Staff Dashboard</h1>
        <p className="admin-dashboard-subtitle">
          Overview of key metrics and recent sales activity.
        </p>
      </div>
      
      {/* Quick Action Links */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <Link to="/staff/sales" className="btn btn-primary btn-md">🛒 Quick Sale</Link>
        <Link to="/staff/customers/register" className="btn btn-secondary btn-md">➕ Register Customer</Link>
      </div>

      <div className="admin-dashboard-grid">
        <div className="admin-dashboard-card">
          <div className="admin-dashboard-card-label">👥 Total Customers</div>
          <p style={{ fontSize: '24px', fontWeight: 700, margin: '8px 0 0 0', color: 'var(--ink-900)' }}>{stats?.totalCustomers || 0}</p>
        </div>
        <div className="admin-dashboard-card">
          <div className="admin-dashboard-card-label">🚗 Total Vehicles</div>
          <p style={{ fontSize: '24px', fontWeight: 700, margin: '8px 0 0 0', color: 'var(--ink-900)' }}>{stats?.totalVehicles || 0}</p>
        </div>
        <div className="admin-dashboard-card">
          <div className="admin-dashboard-card-label">📜 Sales Invoices</div>
          <p style={{ fontSize: '24px', fontWeight: 700, margin: '8px 0 0 0', color: 'var(--ink-900)' }}>{stats?.totalSalesInvoices || 0}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '24px' }}>
        <div className="cs-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: 600 }}>Weekly Sales Performance (7 Days)</h3>
          {loading ? (
             <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-500)' }}>Loading chart data...</div>
          ) : (
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.weeklySales || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--ink-500)'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--ink-500)'}} dx={-10} tickFormatter={(value) => `Rs.${value}`} />
                  <Tooltip 
                    cursor={{fill: 'rgba(0,0,0,0.04)'}} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="sales" fill="var(--blue-600)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
  Line,
  PieChart,
  Pie,
  Cell
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
        <Link to="/staff/sales" className="btn btn-primary btn-md">Quick Sale</Link>
        <Link to="/staff/customers/register" className="btn btn-secondary btn-md">Register Customer</Link>
      </div>

      <div className="admin-dashboard-grid">
        <div className="admin-dashboard-card">
          <div className="admin-dashboard-card-label">Total Customers</div>
          <p style={{ fontSize: '24px', fontWeight: 700, margin: '8px 0 0 0', color: 'var(--ink-900)' }}>{stats?.totalCustomers || 0}</p>
        </div>
        <div className="admin-dashboard-card">
          <div className="admin-dashboard-card-label">Total Vehicles</div>
          <p style={{ fontSize: '24px', fontWeight: 700, margin: '8px 0 0 0', color: 'var(--ink-900)' }}>{stats?.totalVehicles || 0}</p>
        </div>
        <div className="admin-dashboard-card">
          <div className="admin-dashboard-card-label">Sales Invoices</div>
          <p style={{ fontSize: '24px', fontWeight: 700, margin: '8px 0 0 0', color: 'var(--ink-900)' }}>{stats?.totalSalesInvoices || 0}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
        <div className="cs-card" style={{ padding: '24px' }}>
          <h3 className="admin-dashboard-title" style={{ marginBottom: '24px', fontSize: '18px', color: 'var(--ink-900)' }}>Weekly Sales Performance</h3>
          {loading ? (
             <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-500)' }}>Loading chart data...</div>
          ) : (
            <div style={{ height: '250px', width: '100%', fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.weeklySales || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line-soft)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--ink-500)'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--ink-500)'}} tickFormatter={(value) => `Rs.${value}`} />
                  <Tooltip 
                    cursor={{fill: 'var(--bg-app)'}} 
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--line-soft)', boxShadow: 'var(--shadow-sm)' }}
                  />
                  <Bar dataKey="sales" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="cs-card" style={{ padding: '24px' }}>
          <h3 className="admin-dashboard-title" style={{ marginBottom: '24px', fontSize: '18px', color: 'var(--ink-900)' }}>Sales Trend (Line)</h3>
          {loading ? (
             <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-500)' }}>Loading chart data...</div>
          ) : (
            <div style={{ height: '250px', width: '100%', fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.weeklySales || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line-soft)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--ink-500)'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--ink-500)'}} tickFormatter={(value) => `Rs.${value}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--line-soft)', boxShadow: 'var(--shadow-sm)' }}
                  />
                  <Line type="monotone" dataKey="sales" stroke="var(--indigo-500)" strokeWidth={3} dot={{ r: 4, fill: "var(--bg)", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="cs-card" style={{ padding: '24px' }}>
          <h3 className="admin-dashboard-title" style={{ marginBottom: '24px', fontSize: '18px', color: 'var(--ink-900)' }}>System Overview</h3>
          {loading ? (
             <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-500)' }}>Loading chart data...</div>
          ) : (
            <div style={{ height: '250px', width: '100%', fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={[
                    { name: 'Customers', count: stats?.totalCustomers || 0 },
                    { name: 'Vehicles', count: stats?.totalVehicles || 0 },
                    { name: 'Invoices', count: stats?.totalSalesInvoices || 0 }
                  ]}
                  margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--line-soft)" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: 'var(--ink-500)'}} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--ink-900)'}} />
                  <Tooltip 
                    cursor={{fill: 'var(--bg-app)'}} 
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--line-soft)', boxShadow: 'var(--shadow-sm)' }}
                  />
                  <Bar dataKey="count" fill="var(--slate-500)" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

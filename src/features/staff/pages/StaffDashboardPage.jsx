import { useState, useEffect } from "react";
import { api } from "../../../services/api";
import { Link } from "react-router-dom";
import PageHeader from "../../../components/ui/PageHeader";
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
} from "recharts";
import "../../admin-core/pages/AdminDashboard.css";

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
      <PageHeader 
        title="Staff Dashboard" 
        subtitle="Overview of key metrics and recent sales activity." 
      />
      
      {/* Quick Action Links */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <Link to="/staff/sales" className="btn btn-primary btn-md">Quick Sale</Link>
        <Link to="/staff/customers/register" className="btn btn-secondary btn-md">Register Customer</Link>
      </div>

      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <p className="admin-kpi-label">Total Customers</p>
          <p className="admin-kpi-value">{stats?.totalCustomers || 0}</p>
        </div>
        <div className="admin-kpi-card">
          <p className="admin-kpi-label">Total Vehicles</p>
          <p className="admin-kpi-value">{stats?.totalVehicles || 0}</p>
        </div>
        <div className="admin-kpi-card">
          <p className="admin-kpi-label">Sales Invoices</p>
          <p className="admin-kpi-value">{stats?.totalSalesInvoices || 0}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
        <div className="cs-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '18px', color: 'var(--ink-900)', fontFamily: '"Fraunces", serif', fontWeight: 600 }}>Weekly Sales Performance</h3>
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
          <h3 style={{ marginBottom: '24px', fontSize: '18px', color: 'var(--ink-900)', fontFamily: '"Fraunces", serif', fontWeight: 600 }}>Sales Trend (Line)</h3>
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
          <h3 style={{ marginBottom: '24px', fontSize: '18px', color: 'var(--ink-900)', fontFamily: '"Fraunces", serif', fontWeight: 600 }}>System Overview</h3>
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

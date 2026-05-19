import React, { useState, useEffect } from "react";
import { api } from "../../../services/api";
import Table from "../../../components/common/Table";
import Modal from "../../../components/common/Modal";
import "../../admin-core/pages/VendorPage.css";

export default function StaffReportsPage() {
  const [reports, setReports] = useState({ allCustomers: [], regulars: [], highSpenders: [], pendingCredits: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("none");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await api.get("/StaffDashboard/customer-reports");
        
        // Assemble data structures
        const all = data.allCustomers || data.AllCustomers || [];
        
        setReports({
          allCustomers: all,
          regulars: data.regulars || data.Regulars || [],
          highSpenders: data.highSpenders || data.HighSpenders || [],
          pendingCredits: data.pendingCredits || data.PendingCredits || []
        });
      } catch (err) {
        setError("Failed to load reports. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const allColumns = [
    { key: "fullName", label: "CUSTOMER NAME", render: (val) => <span style={{fontWeight: 500}}>{val}</span> },
    { key: "email", label: "EMAIL" },
    { key: "phoneNumber", label: "PHONE", render: (val) => val || "N/A" },
    { key: "invoiceCount", label: "TOTAL INVOICES" },
    { key: "totalSpent", label: "TOTAL SPENT", render: (val) => <span style={{fontWeight: 600}}>Rs. {val.toLocaleString()}</span> }
  ];

  const regularsColumns = [
    { key: "fullName", label: "CUSTOMER NAME", render: (val) => <span style={{fontWeight: 500}}>{val}</span> },
    { key: "email", label: "EMAIL" },
    { key: "phoneNumber", label: "PHONE", render: (val) => val || "N/A" },
    { key: "invoiceCount", label: "TOTAL PURCHASES", render: (val) => <span className="status-badge status-badge--success">{val}</span> },
    { key: "totalSpent", label: "LIFETIME VALUE", render: (val) => <span style={{fontWeight: 600}}>Rs. {val.toLocaleString()}</span> }
  ];

  const highSpenderColumns = [
    { key: "fullName", label: "CUSTOMER NAME", render: (val) => <span style={{fontWeight: 500}}>{val}</span> },
    { key: "email", label: "EMAIL" },
    { key: "phoneNumber", label: "PHONE", render: (val) => val || "N/A" },
    { key: "invoiceCount", label: "TOTAL PURCHASES" },
    { key: "totalSpent", label: "LIFETIME VALUE", render: (val) => <span style={{fontWeight: 700, color: 'var(--ok-ink)'}}>Rs. {val.toLocaleString()}</span> }
  ];

  const pendingColumns = [
    { key: "fullName", label: "CUSTOMER NAME", render: (val) => <span style={{fontWeight: 500}}>{val}</span> },
    { key: "email", label: "EMAIL" },
    { key: "phoneNumber", label: "PHONE", render: (val) => val || "N/A" },
    { key: "pendingInvoicesCount", label: "UNPAID INVOICES", render: (val) => <span className="status-badge status-badge--warning">{val}</span> },
    { key: "pendingAmount", label: "TOTAL DUE", render: (val) => <span style={{fontWeight: 700, color: 'var(--err-ink)'}}>Rs. {val.toLocaleString()}</span> }
  ];

  const getActiveData = () => {
    switch (activeTab) {
      case 'all': return reports.allCustomers;
      case 'regulars': return reports.regulars;
      case 'highSpenders': return reports.highSpenders;
      case 'pendingCredits': return reports.pendingCredits;
      case 'none': default: return [];
    }
  };

  const getActiveColumns = () => {
    switch (activeTab) {
      case 'all': return allColumns;
      case 'regulars': return regularsColumns;
      case 'highSpenders': return highSpenderColumns;
      case 'pendingCredits': return pendingColumns;
      case 'none': default: return allColumns;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'regulars': return "Regular Customers Report";
      case 'highSpenders': return "High Spenders Report";
      case 'pendingCredits': return "Pending Credits Report";
      case 'all': return "Customer Directory";
      case 'none': default: return "Customer Reports";
    }
  };

  return (
    <div className="vendor-page">
      <div className="vendor-page-header">
        <div>
          <h1 className="vendor-page-title">{getPageTitle()}</h1>
          <p className="vendor-page-subtitle">
            {activeTab === 'none' 
              ? "Select a report type below to generate the list."
              : `Showing ${activeTab === 'all' ? 'comprehensive directory' : 'results'} for the selected view.`}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <button 
          className="btn btn-primary" 
          style={{ 
            padding: '14px 28px', 
            fontSize: '16px', 
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(242, 140, 40, 0.20)',
            borderRadius: '10px'
          }}
          onClick={() => setIsModalOpen(true)}
        >
          Generate Report
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Select Report Type"
      >
        <div style={{ padding: '16px', display: 'grid', gap: '12px' }}>
          <p style={{ color: 'var(--ink-500)', fontSize: '14px', marginBottom: '8px' }}>Choose a specific metric to analyze your customer data.</p>
          
          <button 
            className="btn btn-outline"
            style={{ padding: '14px', justifyContent: 'center', width: '100%', fontSize: '15px' }}
            onClick={() => { setActiveTab('regulars'); setIsModalOpen(false); }}>
            Regular Customers (Top count)
          </button>
          
          <button 
            className="btn btn-outline"
            style={{ padding: '14px', justifyContent: 'center', width: '100%', fontSize: '15px' }}
            onClick={() => { setActiveTab('highSpenders'); setIsModalOpen(false); }}>
            High Spenders (Top volume)
          </button>
          
          <button 
            className="btn btn-outline"
            style={{ padding: '14px', justifyContent: 'center', width: '100%', fontSize: '15px' }}
            onClick={() => { setActiveTab('pendingCredits'); setIsModalOpen(false); }}>
            Pending Credits (Due balance)
          </button>
          
          <div style={{ height: '1px', background: 'var(--line-soft)', margin: '8px 0' }} />
          
          <button 
            className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '14px', justifyContent: 'center', width: '100%', fontSize: '15px', ...(activeTab === 'all' ? {} : {background: 'white'}) }}
            onClick={() => { setActiveTab('all'); setIsModalOpen(false); }}>
            Full Customer Directory
          </button>
        </div>
      </Modal>

      {error ? (
        <div style={{ padding: '12px 16px', color: '#b91c1c', backgroundColor: '#fef2f2', border: '1px solid #f87171', borderRadius: '4px', marginBottom: '16px', fontSize: '14px', fontWeight: 500 }}>
          {error}
        </div>
      ) : null}

      <div className="cs-card" style={{ marginTop: '8px' }}>
         <Table 
             columns={getActiveColumns()} 
             data={getActiveData()} 
             loading={loading} 
             emptyMessage={activeTab === 'none' ? "Select a report type to start." : "No customer records found."} 
         />
      </div>
    </div>
  );
}

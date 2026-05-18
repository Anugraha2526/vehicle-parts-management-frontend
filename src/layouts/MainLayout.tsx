import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import './MainLayout.css';

const MainLayout: React.FC = () => {
  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="logo-section">
          <div className="logo-icon">C</div>
          <h1>ChitoSpare</h1>
        </div>

        <nav className="nav-menu">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="icon">📊</span> Dashboard
          </NavLink>
          <NavLink to="/customers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="icon">👤</span> Customers & Vehicles
          </NavLink>
          <NavLink to="/register-customer" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="icon">➕</span> New Registration
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="dark-mode-toggle">
             <span>🌙 Dark mode</span>
             <div className="toggle-switch"></div>
          </div>
          <div className="user-profile">
            <div className="avatar">AS</div>
            <div className="user-info">
              <span className="user-name">Aarav Sharma</span>
              <span className="user-role">Staff</span>
            </div>
            <span className="logout-icon">↪️</span>
          </div>
        </div>
      </aside>

      <main className="content-area">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;

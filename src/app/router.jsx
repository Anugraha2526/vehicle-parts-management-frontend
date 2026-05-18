import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import StaffLayout from "../layouts/StaffLayout";
import CustomerLayout from "../layouts/CustomerLayout";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../routes/ProtectedRoute";
import RoleBasedRoute from "../routes/RoleBasedRoute";
import LoginPage from "../features/auth/pages/LoginPage";
import AdminDashboardPage from "../features/admin-core/pages/AdminDashboardPage";
import StaffPage from "../features/admin-core/pages/StaffPage";
import VendorPage from "../features/admin-core/pages/VendorPage";
import PartsPage from "../features/admin-core/pages/PartsPage";
import PurchaseInvoicePage from "../features/finance/pages/PurchaseInvoicePage";
import FinancialReportsPage from "../features/finance/pages/FinancialReportsPage";
import LowStockAlertsPage from "../features/finance/pages/LowStockAlertsPage";
import CustomerListPage from "../features/customer-crm/pages/CustomerListPage";
import SalesDashboardPage from "../features/sales/pages/SalesDashboardPage";
import OverdueRemindersPage from "../features/sales/pages/OverdueRemindersPage";
import CustomerHomePage from "../features/customer-portal/pages/CustomerHomePage";

import PublicRegister from "../pages/PublicRegister";
import CustomerProfile from "../pages/CustomerProfile";
import CustomersPage from "../pages/CustomersPage";
import CustomerDetails from "../pages/CustomerDetails";
import RegisterCustomer from "../pages/RegisterCustomer";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<PublicRegister />} />
      <Route path="/my-profile/:id" element={<CustomerProfile />} />

      {/* User's Original Pages */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:id" element={<CustomerDetails />} />
        <Route path="register-customer" element={<RegisterCustomer />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route
          path="/admin"
          element={
            <RoleBasedRoute allowedRoles={["Admin"]}>
              <AdminLayout />
            </RoleBasedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="vendors" element={<VendorPage />} />
          <Route path="parts" element={<PartsPage />} />
          <Route path="finance/purchase-invoices" element={<PurchaseInvoicePage />} />
          <Route path="finance/reports" element={<FinancialReportsPage />} />
          <Route path="finance/low-stock" element={<LowStockAlertsPage />} />
          <Route path="reminders" element={<OverdueRemindersPage />} />
        </Route>

        <Route path="/staff" element={<StaffLayout />}>
          <Route path="finance" element={<PurchaseInvoicePage />} />
          <Route path="finance/reports" element={<FinancialReportsPage />} />
          <Route path="finance/low-stock" element={<LowStockAlertsPage />} />
          <Route path="sales" element={<SalesDashboardPage />} />
          <Route path="crm" element={<CustomerListPage />} />
        </Route>

        <Route path="/portal" element={<CustomerLayout />}>
          <Route index element={<CustomerHomePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

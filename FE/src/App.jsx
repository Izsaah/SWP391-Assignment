import { Routes, Route, Navigate } from 'react-router';
import './App.css'
import { AuthProvider } from './app/login/AuthContext';
import React from 'react';
import Login from './app/login/Login';
// (duplicate import removed)

// Staff imports
import { DashBoard as StaffDashboard } from './app/staff/dashboard/Dashboard';
import Inventory from './app/staff/inventory/Inventory';
import CompareModels from './app/staff/inventory/CompareModels';
import Quotations from './app/staff/pages/Quotations';
import Contracts from './app/staff/pages/Contracts';
import PaymentDelivery from './app/staff/pages/PaymentDelivery';
import Customers from './app/staff/pages/Customers';
import CustomerDetail from './app/staff/pages/CustomerDetail';
import Orders from './app/staff/pages/Orders';
import Reports from './app/staff/pages/Reports';
import Settings from './app/staff/pages/Settings';

// Manager imports
import { Dashboard as ManagerDashboard } from './app/manager/Dashboard';
import ManagerVehicleList from './app/manager/inventory/VehicleList';
import ProtectedRoute from './app/login/ProtectedRoute';

// Role-based redirect for root path with auth check
const RoleRedirect = () => {
  try {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      const user = JSON.parse(savedUser);
      const role = user?.roles?.[0]?.roleName;
      const normalized = role === 'Dealer Manager' ? 'MANAGER' : role === 'Dealer Staff' ? 'STAFF' : role;
      if (normalized === 'MANAGER') return <Navigate to="/manager/dashboard" />;
      if (normalized === 'STAFF') return <Navigate to="/staff/dashboard" />;
    }
  } catch {
    // ignore and fall through to login
  }
  return <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/login" element={<Login />} />

        {/* Staff Routes - Only accessible by STAFF role */}
        <Route 
          path="/staff/dashboard" 
          element={
            <ProtectedRoute allowRoles={['STAFF']}>
              <StaffDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/inventory" 
          element={
            <ProtectedRoute allowRoles={['STAFF']}>
              <Inventory />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/inventory/compare" 
          element={
            <ProtectedRoute allowRoles={['STAFF']}>
              <CompareModels />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/sales/quotations" 
          element={
            <ProtectedRoute allowRoles={['STAFF']}>
              <Quotations />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/sales/contracts" 
          element={
            <ProtectedRoute allowRoles={['STAFF']}>
              <Contracts />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/sales/payment-delivery" 
          element={
            <ProtectedRoute allowRoles={['STAFF']}>
              <PaymentDelivery />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/customers" 
          element={
            <ProtectedRoute allowRoles={['STAFF']}>
              <Customers />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/customers/list" 
          element={
            <ProtectedRoute allowRoles={['STAFF']}>
              <Customers />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/customers/:customerId" 
          element={
            <ProtectedRoute allowRoles={['STAFF']}>
              <CustomerDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/orders" 
          element={
            <ProtectedRoute allowRoles={['STAFF']}>
              <Orders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/reports" 
          element={
            <ProtectedRoute allowRoles={['STAFF']}>
              <Reports />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/settings" 
          element={
            <ProtectedRoute allowRoles={['STAFF']}>
              <Settings />
            </ProtectedRoute>
          } 
        />

        {/* Manager Routes - Only accessible by MANAGER role */}
        <Route 
          path="/manager/dashboard" 
          element={
            <ProtectedRoute allowRoles={['MANAGER']}>
              <ManagerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/manager/inventory/vehicles" 
          element={
            <ProtectedRoute allowRoles={['MANAGER']}>
              <ManagerVehicleList />
            </ProtectedRoute>
          } 
        />
        {/* Add more manager routes here as you build them */}

        {/* Legacy redirects - redirect old paths to new role-based paths */}
        <Route path="/dashboard" element={<Navigate to="/staff/dashboard" />} />
        <Route path="/inventory" element={<Navigate to="/staff/inventory" />} />
        <Route path="/inventory/compare" element={<Navigate to="/staff/inventory/compare" />} />
        <Route path="/sales/quotations" element={<Navigate to="/staff/sales/quotations" />} />
        <Route path="/sales/contracts" element={<Navigate to="/staff/sales/contracts" />} />
        <Route path="/sales/payment-delivery" element={<Navigate to="/staff/sales/payment-delivery" />} />
        <Route path="/customers" element={<Navigate to="/staff/customers" />} />
        <Route path="/customers/list" element={<Navigate to="/staff/customers/list" />} />
        <Route path="/customers/:customerId" element={<Navigate to="/staff/customers/:customerId" />} />
        <Route path="/orders" element={<Navigate to="/staff/orders" />} />
        <Route path="/reports" element={<Navigate to="/staff/reports" />} />
        <Route path="/settings" element={<Navigate to="/staff/settings" />} />

        {/* 404 - Not Found */}
        <Route path="*" element={<div className="flex items-center justify-center h-screen"><h1 className="text-2xl font-bold text-gray-800">404 - Page Not Found</h1></div>} />
      </Routes>
    </AuthProvider>
  )
}

export default App

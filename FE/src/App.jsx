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
import OrderForm from './app/staff/pages/OrderForm';
import Payment from './app/staff/pages/Payment';
import Delivery from './app/staff/pages/Delivery';
import Customers from './app/staff/pages/Customers';
import CustomerDetail from './app/staff/pages/CustomerDetail';
import TestDrives from './app/staff/pages/TestDrives';
import Reports from './app/staff/pages/Reports';
import Settings from './app/staff/pages/Settings';

// Manager imports
import { Dashboard as ManagerDashboard } from './app/manager/Dashboard';
import ManagerVehicleList from './app/manager/inventory/VehicleList';
import StockOverview from './app/manager/inventory/StockOverview';
import ModelDetail from './app/manager/inventory/ModelDetail';
import ManufacturerRequestsList from './app/manager/inventory/ManufacturerRequestsList';
import ManagerOrderForm from './app/manager/sales/OrderForm';
import ManagerPayment from './app/manager/sales/Payment';
import ManagerDelivery from './app/manager/sales/Delivery';
import ManagerCustomers from './app/manager/customers/Customers';
import ManagerCustomerDetail from './app/manager/customers/CustomerDetail';
import TestDriveSchedule from './app/manager/testdrive/TestDriveSchedule';
import Promotions from './app/manager/promotions/Promotions';
import PromotionDetail from './app/manager/promotions/PromotionDetail';
import DebtReport from './app/manager/reports/DebtReport';
import SalesPerformance from './app/manager/reports/SalesPerformance';
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
          path="/staff/sales/order-form" 
          element={
            <ProtectedRoute allowRoles={['STAFF']}>
              <OrderForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/sales/payment" 
          element={
            <ProtectedRoute allowRoles={['STAFF']}>
              <Payment />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/sales/delivery" 
          element={
            <ProtectedRoute allowRoles={['STAFF']}>
              <Delivery />
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
          path="/staff/customers/test-drives" 
          element={
            <ProtectedRoute allowRoles={['STAFF']}>
              <TestDrives />
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
        <Route 
          path="/manager/inventory/stock" 
          element={
            <ProtectedRoute allowRoles={['MANAGER']}>
              <StockOverview />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/manager/inventory/model/:modelId" 
          element={
            <ProtectedRoute allowRoles={['MANAGER']}>
              <ModelDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/manager/inventory/manufacturer-requests" 
          element={
            <ProtectedRoute allowRoles={['MANAGER']}>
              <ManufacturerRequestsList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/manager/sales/order-form" 
          element={
            <ProtectedRoute allowRoles={['MANAGER']}>
              <ManagerOrderForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/manager/sales/payment" 
          element={
            <ProtectedRoute allowRoles={['MANAGER']}>
              <ManagerPayment />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/manager/sales/delivery" 
          element={
            <ProtectedRoute allowRoles={['MANAGER']}>
              <ManagerDelivery />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/manager/customers/list" 
          element={
            <ProtectedRoute allowRoles={['MANAGER']}>
              <ManagerCustomers />
            </ProtectedRoute>
          } 
        />
                  <Route 
            path="/manager/customers/:customerId"
            element={
              <ProtectedRoute allowRoles={['MANAGER']}>
                <ManagerCustomerDetail />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/manager/test-drive"
            element={
              <ProtectedRoute allowRoles={['MANAGER']}>
                <TestDriveSchedule />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/manager/promotions"
            element={
              <ProtectedRoute allowRoles={['MANAGER']}>
                <Promotions />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/manager/promotions/:promotionId"
            element={
              <ProtectedRoute allowRoles={['MANAGER']}>
                <PromotionDetail />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/manager/reports/debt"
            element={
              <ProtectedRoute allowRoles={['MANAGER']}>
                <DebtReport />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/manager/reports/sales-performance"
            element={
              <ProtectedRoute allowRoles={['MANAGER']}>
                <SalesPerformance />
              </ProtectedRoute>
            }
          />
        {/* Add more manager routes here as you build them */}

        {/* Legacy redirects - redirect old paths to new role-based paths */}
        <Route path="/dashboard" element={<Navigate to="/staff/dashboard" />} />
        <Route path="/inventory" element={<Navigate to="/staff/inventory" />} />
        <Route path="/inventory/compare" element={<Navigate to="/staff/inventory/compare" />} />
        <Route path="/sales/order-form" element={<Navigate to="/staff/sales/order-form" />} />
        <Route path="/sales/payment" element={<Navigate to="/staff/sales/payment" />} />
        <Route path="/sales/delivery" element={<Navigate to="/staff/sales/delivery" />} />
        <Route path="/sales/payment-delivery" element={<Navigate to="/staff/sales/payment" />} />
        <Route path="/customers" element={<Navigate to="/staff/customers" />} />
        <Route path="/customers/list" element={<Navigate to="/staff/customers/list" />} />
        <Route path="/customers/:customerId" element={<Navigate to="/staff/customers/:customerId" />} />
        <Route path="/reports" element={<Navigate to="/staff/reports" />} />
        <Route path="/settings" element={<Navigate to="/staff/settings" />} />

        {/* 404 - Not Found */}
        <Route path="*" element={<div className="flex items-center justify-center h-screen"><h1 className="text-2xl font-bold text-gray-800">404 - Page Not Found</h1></div>} />
      </Routes>
    </AuthProvider>
  )
}

export default App

import { Routes, Route, Navigate } from 'react-router';
import './App.css'
import { AuthProvider } from './app/login/AuthContext';
import Login from './app/login/Login';
import { DashBoard } from './app/staff/dashboard/Dashboard';
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
import ProtectedRoute from './app/login/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/inventory/compare" element={<CompareModels />} />
        <Route path="/sales/quotations" element={<Quotations />} />
        <Route path="/sales/contracts" element={<Contracts />} />
        <Route path="/sales/payment-delivery" element={<PaymentDelivery />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/list" element={<Customers />} />
        <Route path="/customers/:customerId" element={<CustomerDetail />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </AuthProvider>
  )
}

export default App

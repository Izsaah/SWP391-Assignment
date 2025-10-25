import { Routes, Route, Navigate } from 'react-router';
import './App.css'
import { AuthProvider } from './LoginPage/AuthContext';
import Login from './LoginPage/Login';
import { DashBoard } from './DashBoard/DashBoard';
import Inventory from './pages/Inventory';
import CompareModels from './pages/CompareModels';
import Quotations from './pages/Quotations';
import Contracts from './pages/Contracts';
import PaymentDelivery from './pages/PaymentDelivery';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import ProtectedRoute from './LoginPage/ProtectedRoute';

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
        <Route path="/orders" element={<Orders />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </AuthProvider>
  )
}

export default App

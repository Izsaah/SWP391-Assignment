import { Routes, Route, Navigate } from 'react-router';
import './App.css'
import { AuthProvider } from './Dealer/login/AuthContext';
import Login from './Dealer/login/Login';
import { DashBoard } from './Dealer/staff/dashboard/Dashboard';
import Inventory from './Dealer/staff/inventory/Inventory';
import CompareModels from './Dealer/staff/inventory/CompareModels';
import Quotations from './Dealer/staff/pages/Quotations';
import Contracts from './Dealer/staff/pages/Contracts';
import PaymentDelivery from './Dealer/staff/pages/PaymentDelivery';
import Customers from './Dealer/staff/pages/Customers';
import CustomerDetail from './Dealer/staff/pages/CustomerDetail';
import Orders from './Dealer/staff/pages/Orders';
import Reports from './Dealer/staff/pages/Reports';
import Settings from './Dealer/staff/pages/Settings';
import ProtectedRoute from './Dealer/login/ProtectedRoute';

// EVM area imports
import EVMLayout from './EVM/layout/EVMLayout';
import StaffDashboard from './EVM/pages/staff/StaffDashboard';
import VehicleModels from './EVM/pages/manager/VehicleModels';
import VehicleVariants from './EVM/pages/manager/VehicleVariants';
import InventoryEVM from './EVM/pages/manager/Inventory';
import Promotions from './EVM/pages/manager/Promotions';
import ContractsEVM from './EVM/pages/manager/Contracts';
import Users from './EVM/pages/manager/Users';
import SalesReport from './EVM/pages/manager/SalesReport';
import InventoryReport from './EVM/pages/manager/InventoryReport';

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

        {/* EVM routes */}
        <Route path="/evm" element={<EVMLayout />}>
          <Route index element={<StaffDashboard />} />
          <Route path="vehicle-models" element={<VehicleModels />} />
          <Route path="vehicle-variants" element={<VehicleVariants />} />
          <Route path="inventory" element={<InventoryEVM />} />
          <Route path="promotions" element={<Promotions />} />
          <Route path="contracts" element={<ContractsEVM />} />
          <Route path="users" element={<Users />} />
          <Route path="sales-report" element={<SalesReport />} />
          <Route path="inventory-report" element={<InventoryReport />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App

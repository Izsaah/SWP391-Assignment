import { Routes, Route, Navigate } from 'react-router';
import './App.css'
import { AuthProvider } from './LoginPage/AuthContext';
import Login from './LoginPage/Login';
import { DashBoard } from './DashBoard/DashBoard';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashBoard /></ProtectedRoute>} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </AuthProvider>
  )
}

export default App

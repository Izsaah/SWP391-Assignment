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
import ProtectedRoute from './LoginPage/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  )
}

export default App

import { Routes , Route , Navigate } from 'react-router';
import './App.css'
import { AuthProvider } from './LoginPage/AuthContext';
import Login from './LoginPage/Login';
import { DashBoard } from './DashBoard/DashBoard';
function App() {

  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashBoard />} />
      </Routes>
    </AuthProvider>
  )
}

export default App

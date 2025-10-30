import React from 'react'
import { useAuth } from './useAuth';
import { Navigate } from 'react-router';

// ⚠️ TEMPORARY: Set to true to bypass authentication (for development without backend)
const BYPASS_AUTH = false;

export default function ProtectedRoute({ children , allowRoles }) {
    // Always call hooks before any conditional returns
    const { isAuthenticated , loading , currentUser} = useAuth();
    const LOGIN_DISABLED = String(import.meta.env.VITE_DISABLE_LOGIN || 'false') === 'true';

    // ⚠️ TEMPORARY: Bypass authentication check
    if (BYPASS_AUTH) {
        console.log('⚠️ Authentication bypassed - development mode');
        return children;
    }

    if (loading) {
        return <div>Loading...</div>; // or a spinner
    }
    if (LOGIN_DISABLED && !isAuthenticated) {
        return <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">🚫 Login Disabled</h2>
            <p className="text-gray-600">Login is temporarily disabled. Please try again later.</p>
          </div>
        </div>;
    }
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    // Kiểm tra role (nếu có allowedRoles truyền vào)
    const userRole = currentUser?.roles?.[0]?.roleName; // Backend returns: "Dealer Manager", "Dealer Staff", "Admin", "Customer"
    
    // Normalize role names: support both backend format ("Dealer Manager"/"Dealer Staff") and short format ("MANAGER"/"STAFF")
    const normalizedRole = userRole === 'Dealer Manager' ? 'MANAGER' : 
                           userRole === 'Dealer Staff' ? 'STAFF' : 
                           userRole;
    
    if (allowRoles && !allowRoles.includes(normalizedRole) && !allowRoles.includes(userRole)) {
        return <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">🚫 Access Denied</h2>
            <p className="text-gray-600">You do not have permission to view this page.</p>
            <p className="text-sm text-gray-500 mt-2">Required role: {allowRoles.join(' or ')}</p>
            <p className="text-sm text-gray-500">Your role: {userRole || 'None'}</p>
          </div>
        </div>;
    }


    return children;
}

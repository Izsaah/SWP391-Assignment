import React from 'react'
import { useAuth } from './AuthContext';
import { Navigate } from 'react-router';


export default function ProtectedRoute({ children , allowRoles }) {
    const { isAuthenticated , loading , currentUser} = useAuth();

    if (loading) {
        return <div>Loading...</div>; // or a spinner
    }
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    // Kiểm tra role (nếu có allowedRoles truyền vào)
    const userRole = currentUser?.roles?.[0]?.roleName; // Ví dụ: "ADMIN", "STAFF"
    if (allowRoles && !allowRoles.includes(userRole)) {
        
    return <div>🚫 You do not have permission to view this page.</div>;
}


    return children;
}

import React from 'react';
import { useAuth } from './useAuth';
import { Navigate } from 'react-router';

export default function ProtectedRoute({ children, allowRoles }) {
    // Always call hooks before any conditional returns
    const { isAuthenticated, loading, currentUser } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // Check role permissions (if allowRoles is specified)
    const userRole = currentUser?.roles?.[0]?.roleName; // Backend returns: "Dealer Manager", "Dealer Staff", "Admin", "Customer"

    // Normalize role names: support both backend format ("Dealer Manager"/"Dealer Staff") and short format ("MANAGER"/"STAFF")
    const normalizedRole =
        userRole === 'Dealer Manager'
            ? 'MANAGER'
            : userRole === 'Dealer Staff'
            ? 'STAFF'
            : userRole;

    if (allowRoles && !allowRoles.includes(normalizedRole) && !allowRoles.includes(userRole)) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">🚫 Access Denied</h2>
                    <p className="text-gray-600">You do not have permission to view this page.</p>
                    <p className="text-sm text-gray-500 mt-2">Required role: {allowRoles.join(' or ')}</p>
                    <p className="text-sm text-gray-500">Your role: {userRole || 'None'}</p>
                </div>
            </div>
        );
    }

    return children;
}

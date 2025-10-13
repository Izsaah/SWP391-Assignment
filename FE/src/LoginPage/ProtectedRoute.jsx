import React from 'react'
import { useAuth } from './AuthContext';
import { Navigate } from 'react-router';


export default function ProtectedRoute({ children }) {
    const { isAuthenticated , loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // or a spinner
    }
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }



    return children;
}

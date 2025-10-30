import React, { useState , useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './useAuth';
    export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [token , setToken] = useState(null);
    const [loading , setLoading] = useState(true);
    const [isAuthenticated , setIsAuthenticated] = useState(false);

    
     const API_URL = import.meta.env.VITE_API_URL;
        useEffect(() => {
            const savedToken= localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');
            if (savedToken && savedUser) {
                setToken(savedToken);
                setCurrentUser(JSON.parse(savedUser));
                setIsAuthenticated(true);

                
            }
            setLoading(false);
        }, []);

    // Mock-capable login function: uses backend if available, otherwise optional mock users
    const login = async (email, password) => {
        const LOGIN_DISABLED = String(import.meta.env.VITE_DISABLE_LOGIN || 'false') === 'true';
        if (LOGIN_DISABLED) {
            return { success: false, message: 'Login is temporarily disabled. Please try again later.' };
        }

        const USE_MOCK_AUTH = String(import.meta.env.VITE_MOCK_AUTH || 'true') === 'true';

        // Helper to finalize login and persist
        const completeLogin = (mockToken, mockUser, message) => {
            localStorage.setItem('token', mockToken);
            localStorage.setItem('user', JSON.stringify(mockUser));
            setToken(mockToken);
            setCurrentUser(mockUser);
            setIsAuthenticated(true);
            return { success: true, message: message || 'Đăng nhập thành công', user: mockUser };
        };

        // If API URL is missing and mock is enabled, use mock accounts immediately
        if ((!API_URL || API_URL === 'undefined' || API_URL === '') && USE_MOCK_AUTH) {
            if (email === 'manager@demo.com' && password === '123456') {
                return completeLogin('mock-manager-token', { roles: [{ roleName: 'Dealer Manager' }], email }, 'Đăng nhập mock (Manager)');
            }
            if (email === 'staff@demo.com' && password === '123456') {
                return completeLogin('mock-staff-token', { roles: [{ roleName: 'Dealer Staff' }], email }, 'Đăng nhập mock (Staff)');
            }
            return { success: false, message: 'Sai email hoặc mật khẩu (mock).' };
        }

        // Try real backend first; if it fails and mock enabled, fall back to mock
        try {
            const res = await axios.post(`${API_URL}/login`, { email, password });
            const token = res.data?.data?.token;
            const user = res.data?.data?.user;
            if (token && user) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                setToken(token);
                setCurrentUser(user);
                setIsAuthenticated(true);
                return { success: true, message: res.data.message || 'Đăng nhập thành công', user };
            }
            return { success: false, message: 'Dữ liệu phản hồi không hợp lệ' };
        } catch (error) {
            console.error('Login failed:', error);
            if (USE_MOCK_AUTH) {
                if (email === 'manager@demo.com' && password === '123456') {
                    return completeLogin('mock-manager-token', { roles: [{ roleName: 'Dealer Manager' }], email }, 'Đăng nhập mock (Manager)');
                }
                if (email === 'staff@demo.com' && password === '123456') {
                    return completeLogin('mock-staff-token', { roles: [{ roleName: 'Dealer Staff' }], email }, 'Đăng nhập mock (Staff)');
                }
            }
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể đăng nhập. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.',
            };
        }
    };

  

    // Mock logout function
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setCurrentUser(null);
        setIsAuthenticated(false);
    };

    const value = { 
        currentUser, 
        login,
        token,
        loading,
        isAuthenticated,
        logout
    };
    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

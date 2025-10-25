import React, { createContext , useState , useContext, useEffect } from 'react';
import axios from 'axios';


const AuthContext = createContext();
export function useAuth() {
  return useContext(AuthContext);
}

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

    // Mock login function - replace with your actual authentication logic
    const login = async (email, password) => {
        try{

            const res = await axios.post(`${API_URL}/login`, { email, password });
            const token = res.data?.data?.token;
            const user = res.data?.data?.user;

            if (token && user) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                setToken(token);
                setCurrentUser(user);
                setIsAuthenticated(true);

          return { success: true, message: res.data.message || 'Đăng nhập thành công' };
        } else {
          return { success: false, message: 'Dữ liệu phản hồi không hợp lệ' };
    }
  } catch (error) {
    console.error('Login failed:', error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        'Không thể đăng nhập. Vui lòng kiểm tra lại tài khoản hoặc API.',
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

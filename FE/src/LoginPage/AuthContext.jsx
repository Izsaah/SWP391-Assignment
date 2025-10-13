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

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/login`, { email, password });
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                setToken(res.data.token);
                setCurrentUser(res.data.user);
                setIsAuthenticated(true);

                return {success : true};
            }
        } catch (error) {
            console.error("Login failed:", error);
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


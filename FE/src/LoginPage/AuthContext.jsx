import React, { useEffect , createContext , useState , useContext } from 'react';
import { auth } from '../firebase/Firebase';
import { onAuthStateChanged } from 'firebase/auth';


 const AuthContext = createContext();
 export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userLoggingIn, setUserLoggingIn] = useState(false);
    const [isEmailUser, setIsEmailUser] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, initializeUser)
        return unsubscribe;
    }, []);

    async function initializeUser(user) {
        if (user) {
            setCurrentUser({...user});
            const isEmail = user.providerData.some((provider) => provider.providerId === 'password');
            setIsEmailUser(isEmail);
            setUserLoggingIn(true);
        } else {
            setCurrentUser(null);
            setUserLoggingIn(false);
        }
        setLoading(false);
    }
    const value = { currentUser, userLoggingIn ,isEmailUser, loading};
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );

}

 
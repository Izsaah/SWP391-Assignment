import React from 'react'
import {useAuth} from '../LoginPage/AuthContext'
import { doSignOut } from '../firebase/auth';
import { useNavigate , Navigate } from 'react-router';


export const DashBoard = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    if (!currentUser) {
        // Nếu chưa đăng nhập, chuyển về trang login
        return <Navigate to="/login" replace />;
    }
  return (
    
    <div className='text-2xl font-bold pt-14'>Hello {currentUser.displayName ? currentUser.displayName : currentUser.email}, you are now logged in.
    
    <button onClick={() => { doSignOut().then(() => { navigate('/login') }) }} className='text-sm text-blue-600 underline'>Logout</button>
                   
    </div>
)

}

import React, { useState } from 'react';
import { Navigate } from 'react-router';
import ReactImg from '../assets/car2.jpg'
import { FaGoogle } from "react-icons/fa";
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from '../firebase/auth';
import { useAuth } from './AuthContext';


export default function LoginPage() {
  const { userLoggingIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignIn, setIsSignIn] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isSignIn) {
      setIsSignIn(true);
      try{
        await doSignInWithEmailAndPassword(email, password);
        setError(null);
      } catch(error) {
        if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        setError("Email hoặc mật khẩu không chính xác!");
     } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại!");
  }
        setIsSignIn(false);
      }
    }
  };


    const onGoogleSignIn = async (e) => {
      e.preventDefault();
      if (!isSignIn) {
        setIsSignIn(true);
        doSignInWithGoogle().catch((error) => {
          setError(error.message || "Google sign-in failed");
          setIsSignIn(false);
        });
      }
    }


  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-gray-100 to-gray-200">
      {userLoggingIn && (<Navigate to="/dashboard" replace ={true} />)}
      {console.log(userLoggingIn)}
      <div className="flex w-[1400px] h-[700px] bg-white shadow-2xl rounded-2xl overflow-hidden">
        
        {/* Left - Sign In */}
        <div className="flex-1 flex flex-col justify-center items-center p-10 bg-gradient-to-r from-gray-400 to-gray-200">
          <h2 className="text-3xl font-bold mb-6">Sign In</h2>

          <p className="text-gray-500 mb-4">or use your email password</p>
          <button
            className="flex items-center justify-center bg-white w-full border p-2 mb-4 rounded-md hover:bg-gray-100"
            onClick={onGoogleSignIn}
          >
            <FaGoogle className="mr-2" /> Sign in with Google
          </button>
          {/* Form */}
          <form onSubmit={onSubmit} className="w-full">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-3 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <a href="#" className="text-sm font-medium text-black mb-4">
              Forget Your Password?
            </a>
            {error && (
              <div className="text-red-500 mb-2 text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isSignIn}
              className={`w-full px-4 py-2 mt-4 my-2 text-white font-medium rounded-lg ${isSignIn ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300'}`}
            >
              {isSignIn ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Right - Sign Up Info */}
        <div className="flex-2 text-white flex flex-col justify-center items-center p-10"
          style={{ backgroundImage: `url(${ReactImg})`, backgroundSize: "cover", backgroundPosition: "45% 85%" }}>
            <div className='flex-2 text-white flex flex-col justify-end items-end pl-100 pb-[-100px]   '>

          <h2 className="text-3xl text-neutral-200 font-extrabold mb-4">Porches TayCan</h2>
          <p className="mb-12 text-center">
            Register with your personal details to use all site features
          </p>
            </div>
          
        </div>
      </div>
    </div>
  );
}


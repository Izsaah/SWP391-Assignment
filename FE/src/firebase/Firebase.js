// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDQpnEnVUCCN3-oMkv9R1e-oY_ovRCbj2I",
  authDomain: "auth-f4709.firebaseapp.com",
  projectId: "auth-f4709",
  storageBucket: "auth-f4709.firebasestorage.app",
  messagingSenderId: "1068635869930",
  appId: "1:1068635869930:web:5fdb25abe2420bb42dbd93"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { app , auth };
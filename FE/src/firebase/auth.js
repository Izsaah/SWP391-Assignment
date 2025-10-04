import { auth } from "./Firebase";
import { createUserWithEmailAndPassword,  signInWithEmailAndPassword  } from "firebase/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export const doCreateEmailAndPasswordLogin = async (email, password) => {
  return createUserWithEmailAndPassword(auth ,email, password);
};

export const doSignInWithEmailAndPassword =  (email, password) => {
  return signInWithEmailAndPassword(auth ,email, password);
};

export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  return result;
}

export const doSignOut = async () => {
  return auth.signOut();
};



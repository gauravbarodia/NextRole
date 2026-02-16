import { initializeApp } from "firebase/app";
// 1. Add these imports
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBI9KgFXtdFOHRtVjNZ2fpNZiRypMiSCAk",
  authDomain: "nextrole-249a9.firebaseapp.com",
  projectId: "nextrole-249a9",
  storageBucket: "nextrole-249a9.firebasestorage.app",
  messagingSenderId: "937514043160",
  appId: "1:937514043160:web:1d12dd1fd88608b20fc06d",
  measurementId: "G-5EPMJR2977"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. Initialize and EXPORT these services so App.jsx can use them
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
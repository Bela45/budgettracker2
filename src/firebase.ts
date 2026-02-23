import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxezbO2_6hXDytCObIJCGYdjqTshNcpvQ",
  authDomain: "budget-tracker1-6b08a.firebaseapp.com",
  projectId: "budget-tracker1-6b08a",
  storageBucket: "budget-tracker1-6b08a.firebasestorage.app",
  messagingSenderId: "691928578369",
  appId: "1:691928578369:web:a7fe5c969a90a4f296c9c0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

console.log("Firebase initialized with project:", firebaseConfig.projectId);

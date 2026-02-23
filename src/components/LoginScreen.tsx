import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface LoginScreenProps {
  onLogin: (email: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setError('');
    setLoading(true);
    
    if (!email || !password) {
      setError('Please enter email and password');
      setLoading(false);
      return;
    }

    console.log(`Attempting to ${isSignUp ? 'sign up' : 'login'} with email:`, email);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("Sign up successful:", userCredential.user.uid);
        // Auth state listener in App.tsx will handle the rest
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Login successful:", userCredential.user.uid);
        // Auth state listener in App.tsx will handle the rest
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let errorMessage = 'An error occurred. Please try again.';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'User already exists. Please sign in.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = 'Email or password is incorrect.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/Password login is not enabled in Firebase Console.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Auth state listener in App.tsx will handle the rest
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setError('Failed to sign in with Google. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    onLogin('Demo User');
  };

  return (
    <div className="p-10 text-center">
      <h1 className="text-gray-800 mb-2.5 text-3xl font-bold">💰 My Budget Tracker</h1>
      <p className="text-gray-500 mb-8">Track your expenses and manage your budget</p>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-left">{error}</div>}

      <div className="mb-5 text-left">
        <label className="block mb-2 text-gray-800 font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full p-3 border-2 border-gray-200 rounded-xl text-base transition-colors focus:outline-none focus:border-[#ffd93d]"
          disabled={loading}
        />
      </div>
      
      <div className="mb-5 text-left">
        <label className="block mb-2 text-gray-800 font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="w-full p-3 border-2 border-gray-200 rounded-xl text-base transition-colors focus:outline-none focus:border-[#ffd93d]"
          disabled={loading}
        />
      </div>
      
      <button
        onClick={handleAuth}
        disabled={loading}
        className={`w-full p-3.5 border-none rounded-xl text-base font-semibold cursor-pointer transition-all bg-[#ffd93d] text-gray-800 hover:bg-[#ffc107] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-400/30 mb-2.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
      </button>
      
      <button
        onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
        disabled={loading}
        className="w-full p-2 border-none bg-transparent text-gray-600 text-sm cursor-pointer hover:text-gray-900 mb-2.5"
      >
        {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
      </button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or</span>
        </div>
      </div>

      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full p-3.5 border border-gray-300 rounded-xl text-base font-semibold cursor-pointer transition-all bg-white text-gray-800 hover:bg-gray-50 flex items-center justify-center gap-2 mb-2.5"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Sign in with Google
      </button>
      
      <button
        onClick={handleDemoLogin}
        disabled={loading}
        className="w-full p-3.5 border-none rounded-xl text-base font-semibold cursor-pointer transition-all bg-gray-100 text-gray-800 hover:bg-gray-200"
      >
        Demo Login
      </button>
      
      <p className="mt-5 text-xs text-gray-400">Demo: username: demo / password: demo</p>
      
      <div className="mt-8 text-xs text-gray-400 font-medium">
        Powered by A.Arrosas
      </div>
    </div>
  );
}

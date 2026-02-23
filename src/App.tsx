import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import Calculator from './components/Calculator';
import Reports from './components/Reports';
import Insights from './components/Insights';
import TransactionList from './components/TransactionList';
import { Transaction, Tab } from './types';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const BUDGET = 6000;
const INCOME = 5500;

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('calculator');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed:", currentUser ? "User logged in" : "User logged out");
      if (currentUser) {
        setUser(currentUser.email);
      } else {
        // If we are not logged in via Firebase, we might be in Demo mode or logged out.
        // We don't forcibly clear 'user' here to allow Demo mode to persist if set manually,
        // UNLESS we want to ensure firebase logout clears everything.
        // For now, let's leave it as is, but log it.
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('budgetTrackerData');
    if (saved) {
      try {
        setTransactions(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved data', e);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('budgetTrackerData', JSON.stringify(transactions));
  }, [transactions]);

  const handleLogin = (username: string) => {
    setUser(username);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setActiveTab('calculator');
    } catch (error) {
      console.error("Error signing out: ", error);
      // Fallback for demo user
      setUser(null);
      setActiveTab('calculator');
    }
  };

  const addTransaction = (newTransaction: Omit<Transaction, 'id' | 'date'>) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: Date.now(),
      date: new Date().toISOString(),
    };
    setTransactions((prev) => [...prev, transaction]);
    setActiveTab('transactions');
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="w-full max-w-[450px] bg-white rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] overflow-hidden min-h-[600px] flex flex-col justify-center">
        <LoginScreen onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[450px] bg-white rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] overflow-hidden min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="bg-[#ffd93d] p-5 flex justify-between items-center shadow-sm z-10">
        <h2 className="text-gray-800 text-xl font-bold m-0">My Budget Tracker</h2>
        <div className="flex items-center gap-2.5">
          <span className="font-medium text-sm">{user}</span>
          <button 
            onClick={handleLogout}
            className="bg-black/10 border-none py-2 px-3 rounded-lg cursor-pointer text-sm text-gray-800 hover:bg-black/20 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-5 overflow-y-auto max-h-[700px]">
        {/* Tab Navigation */}
        <div className="flex gap-2.5 mb-5 border-b-2 border-gray-100">
          {(['calculator', 'reports', 'insights', 'transactions'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-1 border-none bg-transparent cursor-pointer font-medium text-gray-500 border-b-2 transition-all capitalize -mb-[2px] hover:text-[#ffd93d] ${
                activeTab === tab ? 'text-[#ffd93d] border-[#ffd93d]' : 'border-transparent'
              }`}
            >
              {tab === 'transactions' ? 'List' : tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-300">
          {activeTab === 'calculator' && <Calculator onAddTransaction={addTransaction} />}
          {activeTab === 'reports' && <Reports transactions={transactions} income={INCOME} budget={BUDGET} />}
          {activeTab === 'insights' && <Insights transactions={transactions} />}
          {activeTab === 'transactions' && <TransactionList transactions={transactions} income={INCOME} />}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import Calculator from './components/Calculator';
import Reports from './components/Reports';
import Insights from './components/Insights';
import TransactionList from './components/TransactionList';
import { Transaction, Tab, UserProfile } from './types';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, orderBy, doc, getDoc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('calculator');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({ budget: 0, income: 0 });
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed:", currentUser ? "User logged in" : "User logged out");
      if (currentUser) {
        setUser(currentUser.email);
        setUserId(currentUser.uid);
        setIsDemo(false);
      } else {
        if (!isDemo) {
          setUser(null);
          setUserId(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isDemo]);

  // Load User Profile (Budget & Income)
  useEffect(() => {
    if (userId && !isDemo) {
      const userDocRef = doc(db, "users", userId);
      
      // Real-time listener for user profile
      const unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        } else {
          // Create default profile if it doesn't exist
          const defaultProfile: UserProfile = { budget: 0, income: 0 };
          await setDoc(userDocRef, defaultProfile);
          setUserProfile(defaultProfile);
        }
      });

      return () => unsubscribe();
    } else if (isDemo) {
      // Demo defaults
      setUserProfile({ budget: 0, income: 0 });
    } else {
      setUserProfile({ budget: 0, income: 0 });
    }
  }, [userId, isDemo]);

  // Load data from Firestore or LocalStorage
  useEffect(() => {
    if (userId && !isDemo) {
      // Firestore mode
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", userId),
        orderBy("date", "desc") // Ensure you have an index for this if needed, or sort client-side if small data
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedTransactions: Transaction[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          loadedTransactions.push({
            id: doc.id,
            category: data.category,
            icon: data.icon,
            amount: data.amount,
            memo: data.memo,
            date: data.date,
            type: data.type,
            userId: data.userId
          });
        });
        // Sort again just in case or if index is missing/failed
        loadedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(loadedTransactions);
      }, (error) => {
        console.error("Error fetching transactions: ", error);
        // Fallback or error handling
      });

      return () => unsubscribe();
    } else if (isDemo) {
      // Demo mode: Load from localStorage
      const saved = localStorage.getItem('budgetTrackerData_Demo');
      if (saved) {
        try {
          setTransactions(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse saved data', e);
        }
      } else {
        setTransactions([]);
      }
    } else {
      setTransactions([]);
    }
  }, [userId, isDemo]);

  // Save data to localStorage (Demo Mode Only)
  useEffect(() => {
    if (isDemo) {
      localStorage.setItem('budgetTrackerData_Demo', JSON.stringify(transactions));
    }
  }, [transactions, isDemo]);

  const handleLogin = (username: string) => {
    if (username === 'Demo User') {
      setUser('Demo User');
      setIsDemo(true);
    } else {
      // Should be handled by onAuthStateChanged for real users
    }
  };

  const handleLogout = async () => {
    if (isDemo) {
      setUser(null);
      setUserId(null);
      setIsDemo(false);
      setActiveTab('calculator');
    } else {
      try {
        await signOut(auth);
        setUser(null);
        setUserId(null);
        setActiveTab('calculator');
      } catch (error) {
        console.error("Error signing out: ", error);
        setUser(null);
        setActiveTab('calculator');
      }
    }
  };

  const addTransaction = async (newTransaction: Omit<Transaction, 'id'>) => {
    const transactionData = {
      ...newTransaction,
      date: newTransaction.date || new Date().toISOString(), // Use provided date or current date
      userId: userId,
      // type is already in newTransaction, do not overwrite it
    };

    if (userId && !isDemo) {
      try {
        await addDoc(collection(db, "transactions"), transactionData);
        setActiveTab('transactions');
      } catch (e) {
        console.error("Error adding document: ", e);
        alert("Failed to save transaction to cloud.");
      }
    } else {
      // Demo mode
      const transaction: Transaction = {
        ...transactionData,
        id: Date.now(), // Local ID
        type: (transactionData as any).type || 'expense' // Ensure type is preserved
      };
      setTransactions((prev) => [transaction, ...prev]);
      setActiveTab('transactions');
    }
  };

  const updateProfile = async (newProfile: Partial<UserProfile>) => {
    if (userId && !isDemo) {
      try {
        const userDocRef = doc(db, "users", userId);
        await setDoc(userDocRef, { ...userProfile, ...newProfile }, { merge: true });
      } catch (e) {
        console.error("Error updating profile: ", e);
        alert("Failed to update profile.");
      }
    } else if (isDemo) {
      setUserProfile(prev => ({ ...prev, ...newProfile }));
    }
  };

  const resetData = async () => {
    console.log("Resetting data...");
    if (!window.confirm("Are you sure you want to reset all expenses and income? This cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      if (userId && !isDemo) {
        // Delete all transactions
        const q = query(collection(db, "transactions"), where("userId", "==", userId));
        const snapshot = await getDocs(q);
        console.log(`Deleting ${snapshot.size} transactions...`);
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        // Reset user profile
        const userDocRef = doc(db, "users", userId);
        await setDoc(userDocRef, { budget: 0, income: 0 });
        console.log("User profile reset.");
        
        alert("Data reset successfully.");
      } else if (isDemo) {
        setTransactions([]);
        setUserProfile({ budget: 0, income: 0 });
        localStorage.removeItem('budgetTrackerData_Demo'); // Explicitly remove
        alert("Data reset successfully.");
      }
    } catch (e) {
      console.error("Error resetting data: ", e);
      alert("Failed to reset data. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id: string | number) => {
    if (!window.confirm("Delete this transaction?")) return;

    if (userId && !isDemo) {
      try {
        await deleteDoc(doc(db, "transactions", String(id)));
      } catch (e) {
        console.error("Error deleting document: ", e);
        alert("Failed to delete transaction.");
      }
    } else {
      // Demo mode
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
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
        <h2 className="text-gray-800 text-xl font-bold m-0">Budget Central Tracker</h2>
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
          {activeTab === 'reports' && (
            <Reports 
              transactions={transactions} 
              income={userProfile.income} 
              budget={userProfile.budget} 
              onUpdateProfile={updateProfile}
              onReset={resetData}
            />
          )}
          {activeTab === 'insights' && <Insights transactions={transactions} />}
          {activeTab === 'transactions' && (
            <TransactionList 
              transactions={transactions} 
              income={userProfile.income} 
              onDelete={deleteTransaction}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 text-center text-xs text-gray-400 bg-gray-50 border-t border-gray-100">
        Powered by A.Arrosas
      </div>
    </div>
  );
}

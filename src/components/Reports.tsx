import React from 'react';
import { Transaction, UserProfile } from '../types';

interface ReportsProps {
  transactions: Transaction[];
  income: number;
  budget: number;
  onUpdateProfile?: (profile: Partial<UserProfile>) => void;
  onReset?: () => void;
}

export default function Reports({ transactions, income, budget, onUpdateProfile, onReset }: ReportsProps) {
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncomeTransactions = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = income + totalIncomeTransactions;

  const balance = totalIncome - totalExpenses;
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

  const handleEdit = () => {
    if (!onUpdateProfile) return;
    
    const currentIncome = income.toString();

    const newIncome = prompt("Enter new BASE monthly income (excluding transactions):", currentIncome);
    if (newIncome === null) return; // Cancelled

    const parsedIncome = parseFloat(newIncome);

    if (!isNaN(parsedIncome)) {
      onUpdateProfile({ income: parsedIncome });
    } else {
      alert("Invalid number entered. Please try again.");
    }
  };

  return (
    <div>
      <div className="bg-gray-50 p-5 rounded-xl mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">This Month</h3>
          <div className="flex gap-2">
            {onUpdateProfile && (
              <button 
                onClick={handleEdit}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-gray-700 transition-colors"
              >
                Edit Income
              </button>
            )}
            {onReset && (
              <button 
                onClick={onReset}
                className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-red-700 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>
        <div className="text-4xl font-bold text-gray-800 mb-5">{currentMonth}</div>
        <div className="flex justify-around mb-5">
          <div className="text-center">
            <div className="text-gray-500 text-sm mb-1">Expenses</div>
            <div className="text-xl font-semibold text-red-500">-{totalExpenses.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 text-sm mb-1">Income</div>
            <div className="text-xl font-semibold text-green-500">{totalIncome.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-5 rounded-xl mb-4">
        <h3 className="mb-4 font-bold text-lg">Monthly Summary</h3>
        <div className="bg-white p-4 rounded-xl">
          <div className="text-sm">
            <div className="flex justify-between mb-2">
              <span>Balance:</span>
              <strong>{balance.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between mb-2">
              <span>Expenses:</span>
              <strong>{totalExpenses.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

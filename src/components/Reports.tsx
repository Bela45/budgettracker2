import React from 'react';
import { Transaction, UserProfile } from '../types';

interface ReportsProps {
  transactions: Transaction[];
  income: number;
  budget: number;
  onUpdateProfile?: (profile: Partial<UserProfile>) => void;
}

export default function Reports({ transactions, income, budget, onUpdateProfile }: ReportsProps) {
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncomeTransactions = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = income + totalIncomeTransactions;

  const balance = totalIncome - totalExpenses;
  const balancePercent = budget > 0 ? ((balance / budget) * 100).toFixed(2) : '0.00';
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

  const handleEdit = () => {
    if (!onUpdateProfile) return;
    
    const newIncome = prompt("Enter new monthly income:", income.toString());
    const newBudget = prompt("Enter new monthly budget:", budget.toString());

    if (newIncome !== null && newBudget !== null) {
      const parsedIncome = parseFloat(newIncome);
      const parsedBudget = parseFloat(newBudget);

      if (!isNaN(parsedIncome) && !isNaN(parsedBudget)) {
        onUpdateProfile({ income: parsedIncome, budget: parsedBudget });
      } else {
        alert("Invalid numbers entered.");
      }
    }
  };

  return (
    <div>
      <div className="bg-gray-50 p-5 rounded-xl mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">This Month</h3>
          {onUpdateProfile && (
            <button 
              onClick={handleEdit}
              className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-gray-700 transition-colors"
            >
              Edit Budget/Income
            </button>
          )}
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
        <h3 className="mb-4 font-bold text-lg">Monthly Budget</h3>
        <div className="bg-white p-4 rounded-xl">
          <div className="w-[100px] h-[100px] rounded-full border-8 border-[#ffd93d] flex flex-col justify-center items-center mx-auto mb-4">
            <div className="text-center">
              <div className="text-xs text-gray-500">Balance</div>
              <div className="text-lg font-bold">{balancePercent}%</div>
            </div>
          </div>
          <div className="text-sm">
            <div className="flex justify-between mb-2">
              <span>Balance:</span>
              <strong>{balance.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between mb-2">
              <span>Budget:</span>
              <strong>{budget.toFixed(2)}</strong>
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

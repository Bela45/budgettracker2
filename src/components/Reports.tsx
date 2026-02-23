import React from 'react';
import { Transaction } from '../types';

interface ReportsProps {
  transactions: Transaction[];
  income: number;
  budget: number;
}

export default function Reports({ transactions, income, budget }: ReportsProps) {
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - totalExpenses;
  const balancePercent = ((balance / budget) * 100).toFixed(2);
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

  return (
    <div>
      <div className="bg-gray-50 p-5 rounded-xl mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">This Month</h3>
        </div>
        <div className="text-4xl font-bold text-gray-800 mb-5">{currentMonth}</div>
        <div className="flex justify-around mb-5">
          <div className="text-center">
            <div className="text-gray-500 text-sm mb-1">Expenses</div>
            <div className="text-xl font-semibold text-red-500">-{totalExpenses.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 text-sm mb-1">Income</div>
            <div className="text-xl font-semibold text-green-500">{income.toFixed(2)}</div>
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

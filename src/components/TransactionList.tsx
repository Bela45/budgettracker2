import React from 'react';
import { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  income: number;
}

export default function TransactionList({ transactions, income }: TransactionListProps) {
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const colors = ['#ffcdd2', '#f8bbd0', '#e1bee7', '#c5cae9', '#bbdefb', '#b2dfdb', '#c8e6c9', '#dcedc8'];

  // Sort by date descending (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => b.id - a.id);

  return (
    <div>
      <div className="bg-[#ffd93d] p-4 rounded-xl mb-4 flex justify-between items-center text-gray-800 shadow-sm">
        <div>
          <div className="text-sm opacity-80">2022</div>
          <div className="text-2xl font-bold">09 ▼</div>
        </div>
        <div className="text-right">
          <div className="text-xs opacity-80">Expenses</div>
          <div className="font-bold">-{totalExpenses.toFixed(2)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs opacity-80">Income</div>
          <div className="font-bold">{income.toFixed(2)}</div>
        </div>
      </div>

      <div className="space-y-2.5">
        {sortedTransactions.map((t, index) => (
          <div key={t.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div 
              className="w-11 h-11 rounded-full flex items-center justify-center text-xl shadow-sm"
              style={{ background: colors[index % colors.length] }}
            >
              {t.icon}
            </div>
            <div className="flex-1">
              <div className="font-semibold mb-0.5 text-gray-800">{t.category}</div>
              <div className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()} - {t.memo}</div>
            </div>
            <div className="font-bold text-base text-gray-800">
              {t.type === 'expense' ? '-' : '+'}{t.amount.toFixed(2)}
            </div>
          </div>
        ))}
        {sortedTransactions.length === 0 && (
          <div className="text-center text-gray-400 py-10">No transactions found</div>
        )}
      </div>
    </div>
  );
}

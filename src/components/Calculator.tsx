import React, { useState } from 'react';
import { Transaction } from '../types';

interface CalculatorProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const EXPENSE_CATEGORIES = [
  { name: 'Food', icon: '🍽️' },
  { name: 'Entertainment', icon: '🎬' },
  { name: 'Telephone', icon: '📱' },
  { name: 'Shopping', icon: '🛒' },
  { name: 'Education', icon: '📚' },
  { name: 'Beauty', icon: '💄' },
  { name: 'Sport', icon: '🏊' },
  { name: 'Social', icon: '👥' },
  { name: 'Transportation', icon: '🚌' },
  { name: 'Clothing', icon: '👕' },
  { name: 'Car', icon: '🚗' },
  { name: 'Wine', icon: '🍷' },
  { name: 'Cigarette', icon: '🚬' },
  { name: 'Electronics', icon: '💻' },
  { name: 'Travel', icon: '✈️' },
  { name: 'Health', icon: '🏥' },
  { name: 'Pet', icon: '🐾' },
  { name: 'Tools', icon: '🔧' },
  { name: 'Home', icon: '🏠' },
  { name: 'Gift', icon: '🎁' },
];

const INCOME_CATEGORIES = [
  { name: 'Salary', icon: '💰' },
  { name: 'Bonus', icon: '🎉' },
  { name: 'Gift', icon: '🎁' },
  { name: 'Investment', icon: '📈' },
  { name: 'Other', icon: '💵' },
];

export default function Calculator({ onAddTransaction }: CalculatorProps) {
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [selectedCategory, setSelectedCategory] = useState<{ name: string; icon: string } | null>(null);
  const [calcValue, setCalcValue] = useState('0');
  const [memo, setMemo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = transactionType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const appendNumber = (num: string) => {
    setCalcValue((prev) => (prev === '0' ? num : prev + num));
  };

  const appendOperator = (op: string) => {
    setCalcValue((prev) => prev + op);
  };

  const clearCalc = () => {
    setCalcValue((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const handleSave = () => {
    if (!selectedCategory) {
      alert('Please select a category first');
      return;
    }

    try {
      // eslint-disable-next-line no-eval
      const amount = eval(calcValue); // Using eval for simple calculator logic as per template
      
      if (isNaN(amount)) throw new Error('Invalid calculation');

      onAddTransaction({
        category: selectedCategory.name,
        icon: selectedCategory.icon,
        amount: Number(amount),
        memo: memo || 'No memo',
        type: transactionType,
        date: new Date(date).toISOString(), // Use selected date
      });

      setCalcValue('0');
      setMemo('');
      alert(`Added ${transactionType} - ${selectedCategory.name}: $${amount.toFixed(2)}`);
    } catch (error) {
      alert('Invalid calculation');
    }
  };

  return (
    <div>
      <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
        <button
          onClick={() => { setTransactionType('expense'); setSelectedCategory(null); }}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all border-none cursor-pointer ${
            transactionType === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500 bg-transparent'
          }`}
        >
          Expense
        </button>
        <button
          onClick={() => { setTransactionType('income'); setSelectedCategory(null); }}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all border-none cursor-pointer ${
            transactionType === 'income' ? 'bg-white text-green-500 shadow-sm' : 'text-gray-500 bg-transparent'
          }`}
        >
          Income
        </button>
      </div>

      <h3 className="mb-4 font-bold text-lg">Select Category</h3>
      <div className="grid grid-cols-4 gap-3 mb-5">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
              selectedCategory?.name === cat.name
                ? 'bg-[#ffd93d] border-[#ffc107]'
                : 'bg-gray-100 border-transparent hover:bg-[#ffd93d] hover:border-[#ffc107]'
            }`}
          >
            <div className="text-2xl mb-1">{cat.icon}</div>
            <div className="text-[11px] text-gray-800">{cat.name}</div>
          </button>
        ))}
      </div>

      <div className="bg-gray-50 p-4 rounded-xl mb-4">
        <div className={`bg-white p-4 rounded-lg text-right text-2xl font-semibold mb-2.5 min-h-[50px] ${transactionType === 'income' ? 'text-green-500' : 'text-red-500'}`}>
          {transactionType === 'expense' ? '-' : '+'}{calcValue}
        </div>
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="Enter a memo..."
          className="w-full p-2.5 border border-gray-200 rounded-lg mb-2.5 text-sm focus:outline-none focus:border-[#ffd93d]"
        />
        <div className="grid grid-cols-4 gap-2">
          {['7', '8', '9'].map((n) => (
            <button key={n} onClick={() => appendNumber(n)} className="p-4 border-none rounded-lg bg-white text-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer">{n}</button>
          ))}
          
          <div className="relative">
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button className="w-full h-full p-0 border-none rounded-lg bg-white text-xs font-medium hover:bg-gray-100 transition-colors cursor-pointer flex flex-col items-center justify-center">
              <span>📅</span>
              <span>{new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </button>
          </div>
          
          {['4', '5', '6'].map((n) => (
            <button key={n} onClick={() => appendNumber(n)} className="p-4 border-none rounded-lg bg-white text-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer">{n}</button>
          ))}
          <button onClick={() => appendOperator('+')} className="p-4 border-none rounded-lg bg-white text-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer">+</button>
          
          {['1', '2', '3'].map((n) => (
            <button key={n} onClick={() => appendNumber(n)} className="p-4 border-none rounded-lg bg-white text-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer">{n}</button>
          ))}
          <button onClick={() => appendOperator('-')} className="p-4 border-none rounded-lg bg-white text-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer">−</button>
          
          <button onClick={() => appendNumber('.')} className="p-4 border-none rounded-lg bg-white text-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer">.</button>
          <button onClick={() => appendNumber('0')} className="p-4 border-none rounded-lg bg-white text-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer">0</button>
          <button onClick={clearCalc} className="p-4 border-none rounded-lg bg-white text-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer">⌫</button>
          <button onClick={handleSave} className="p-4 border-none rounded-lg bg-[#ffd93d] text-lg font-semibold hover:bg-[#ffc107] transition-colors cursor-pointer">=</button>
        </div>
      </div>
    </div>
  );
}

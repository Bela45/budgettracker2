import React from 'react';
import { Transaction } from '../types';

interface InsightsProps {
  transactions: Transaction[];
}

export default function Insights({ transactions }: InsightsProps) {
  // Calculate category totals
  const categoryTotals = transactions.reduce((acc, t) => {
    if (t.type === 'expense') {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const totalExpenses = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

  // Sort categories by amount
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(2) : '0.00',
    }));

  // Assign colors (cycling through a palette)
  const colors = ['#ffd93d', '#64b5f6', '#f48fb1', '#4db6ac', '#b0bec5', '#e1bee7', '#ffcc80', '#a5d6a7'];
  
  // For the donut chart, we need to construct a conic-gradient string dynamically
  let currentAngle = 0;
  const gradientSegments = sortedCategories.map((cat, index) => {
    const percentage = Number(cat.percentage);
    const degrees = (percentage / 100) * 360;
    const start = currentAngle;
    const end = currentAngle + degrees;
    currentAngle = end;
    return `${colors[index % colors.length]} ${start}deg ${end}deg`;
  });

  // If no data, show a gray circle
  const gradientString = gradientSegments.length > 0 
    ? `conic-gradient(${gradientSegments.join(', ')})`
    : 'conic-gradient(#eee 0deg 360deg)';

  return (
    <div>
      <div className="bg-gray-50 p-5 rounded-xl mb-4">
        <h3 className="mb-2.5 font-bold text-lg">Expenses</h3>
        <div className="flex gap-2.5 mb-4">
          <button className="flex-1 p-2 border-none bg-gray-800 text-white rounded-lg cursor-pointer">Month</button>
          <button className="flex-1 p-2 border-none bg-[#ffd93d] text-gray-800 rounded-lg cursor-pointer">Year</button>
        </div>
        
        <div 
          className="w-[150px] h-[150px] rounded-full mx-auto my-5 relative"
          style={{ background: gradientString }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] bg-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
            {totalExpenses.toFixed(2)}
          </div>
        </div>

        <div className="mt-4">
          {sortedCategories.slice(0, 5).map((cat, index) => (
            <div key={cat.name} className="flex items-center gap-2.5 mb-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ background: colors[index % colors.length] }}
              ></div>
              <span>{cat.name}</span>
              <span className="ml-auto font-medium">{cat.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <h3 className="mb-4 font-bold text-lg">Top Lists</h3>
        {sortedCategories.map((cat, index) => {
          // Find icon from transactions (inefficient but simple for this scale)
          const icon = transactions.find(t => t.category === cat.name)?.icon || '📦';
          const color = colors[index % colors.length];
          
          return (
            <div key={cat.name} className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-opacity-20"
                style={{ backgroundColor: color + '40' }} // adding transparency
              >
                {icon}
              </div>
              <div className="flex-1">
                <div className="font-semibold mb-1 text-sm">{cat.name} {cat.percentage}%</div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ width: `${cat.percentage}%`, background: color }}
                  ></div>
                </div>
              </div>
              <div className="font-bold text-gray-800">{cat.amount.toFixed(2)}</div>
            </div>
          );
        })}
        {sortedCategories.length === 0 && (
          <div className="text-center text-gray-400 py-4">No expenses yet</div>
        )}
      </div>
    </div>
  );
}

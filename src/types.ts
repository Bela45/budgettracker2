export interface Transaction {
  id: number | string;
  category: string;
  icon: string;
  amount: number;
  memo: string;
  date: string;
  type: 'expense' | 'income';
  userId?: string;
}

export interface UserProfile {
  budget: number;
  income: number;
}

export type Tab = 'calculator' | 'reports' | 'insights' | 'transactions';

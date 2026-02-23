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

export type Tab = 'calculator' | 'reports' | 'insights' | 'transactions';

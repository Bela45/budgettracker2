export interface Transaction {
  id: number;
  category: string;
  icon: string;
  amount: number;
  memo: string;
  date: string;
  type: 'expense' | 'income';
}

export type Tab = 'calculator' | 'reports' | 'insights' | 'transactions';

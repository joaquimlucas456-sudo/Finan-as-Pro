export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  paymentMethod: string;
  bank: string;
  isInstallment: boolean;
  installmentInfo: string;
  importance: 'Essencial' | 'Não Essencial';
  groupId?: string;
}

export interface SavingsItem {
  id: string;
  amount: number;
  description: string;
}

export interface MonthData {
  id: string;
  name: string;
  income: Transaction[];
  expenses: Transaction[];
  savings: SavingsItem[];
}


export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum TransactionStatus {
  PAID = 'PAID',
  OPEN = 'OPEN',
  OVERDUE = 'OVERDUE'
}

export enum AccountType {
  BANK = 'BANK',
  WALLET = 'WALLET',
  CASH = 'CASH'
}

export enum PaymentMethod {
  ACCOUNT = 'ACCOUNT',
  CARD = 'CARD'
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  currentBalance: number;
  color: string;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  color: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  dueDate: string;
  type: TransactionType;
  status: TransactionStatus;
  accountId?: string;
  cardId?: string;
  category: string;
  isInstallment: boolean;
  installmentNumber?: number;
  totalInstallments?: number;
  groupId?: string; 
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isPro: boolean;
  subscriptionActive: boolean;
  subscriptionExpiry?: string;
  createdAt: string;
}

// Added isPro and licenseKey to UserConfig to support local PRO feature activation and license tracking
export interface UserConfig {
  theme: 'light' | 'dark';
  hideFreeModalUntil?: string; // Data para silenciar modal
  isPro: boolean;
  licenseKey?: string;
}

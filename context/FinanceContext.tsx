
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Account, CreditCard, Transaction, TransactionStatus, TransactionType } from '../types';
import { storageService } from '../services/storageService';
import { useAuth } from './AuthContext';
import { apiService } from '../services/apiService';

interface FinanceContextType {
  accounts: Account[];
  cards: CreditCard[];
  transactions: Transaction[];
  addAccount: (account: Omit<Account, 'id' | 'currentBalance'>) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;
  addCard: (card: Omit<CreditCard, 'id'>) => Promise<boolean>;
  updateCard: (card: CreditCard) => void;
  deleteCard: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>, installments?: number) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  toggleTransactionStatus: (id: string) => void;
  isPro: boolean;
  canAccessHistory: (date: Date) => boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const isPro = user?.isPro || false;

  useEffect(() => {
    if (isAuthenticated && user) {
      apiService.fetchData(user.id).then(data => {
        setAccounts(data.accounts);
        setCards(data.cards);
        setTransactions(data.transactions);
      });
    }
  }, [isAuthenticated, user]);

  const saveAll = useCallback((newAccs: Account[], newCards: CreditCard[], newTrans: Transaction[]) => {
    storageService.saveAccounts(newAccs);
    storageService.saveCards(newCards);
    storageService.saveTransactions(newTrans);
  }, []);

  const recalculateBalances = useCallback((currentAccounts: Account[], currentTransactions: Transaction[]) => {
    return currentAccounts.map(acc => {
      const accTransactions = currentTransactions.filter(t => t.accountId === acc.id && t.status === TransactionStatus.PAID);
      const balance = accTransactions.reduce((sum, t) => {
        return t.type === TransactionType.INCOME ? sum + t.amount : sum - t.amount;
      }, acc.initialBalance);
      return { ...acc, currentBalance: balance };
    });
  }, []);

  const addAccount = (accData: Omit<Account, 'id' | 'currentBalance'>) => {
    const id = crypto.randomUUID();
    const newAccount: Account = { ...accData, id, currentBalance: accData.initialBalance };
    const updatedAccs = [...accounts, newAccount];
    setAccounts(recalculateBalances(updatedAccs, transactions));
    saveAll(updatedAccs, cards, transactions);
  };

  const updateAccount = (account: Account) => {
    const updated = accounts.map(a => a.id === account.id ? account : a);
    setAccounts(recalculateBalances(updated, transactions));
    saveAll(updated, cards, transactions);
  };

  const deleteAccount = (id: string) => {
    const updatedAccs = accounts.filter(a => a.id !== id);
    const updatedTrans = transactions.filter(t => t.accountId !== id);
    setAccounts(updatedAccs);
    setTransactions(updatedTrans);
    saveAll(updatedAccs, cards, updatedTrans);
  };

  const addCard = async (cardData: Omit<CreditCard, 'id'>) => {
    if (!isPro && cards.length >= 3) {
      return false;
    }
    const newCard = { ...cardData, id: crypto.randomUUID() };
    const updated = [...cards, newCard];
    setCards(updated);
    saveAll(accounts, updated, transactions);
    return true;
  };

  const updateCard = (card: CreditCard) => {
    const updated = cards.map(c => c.id === card.id ? card : c);
    setCards(updated);
    saveAll(accounts, updated, transactions);
  };

  const deleteCard = (id: string) => {
    const updatedCards = cards.filter(c => c.id !== id);
    const updatedTrans = transactions.filter(t => t.cardId !== id);
    setCards(updatedCards);
    setTransactions(updatedTrans);
    saveAll(accounts, updatedCards, updatedTrans);
  };

  const addTransaction = (tData: Omit<Transaction, 'id'>, installmentsCount: number = 1) => {
    const groupId = crypto.randomUUID();
    const newTransactions: Transaction[] = [];
    for (let i = 0; i < installmentsCount; i++) {
      const date = new Date(tData.date);
      date.setMonth(date.getMonth() + i);
      const dueDate = new Date(tData.dueDate);
      dueDate.setMonth(dueDate.getTime() + i);
      newTransactions.push({
        ...tData,
        id: crypto.randomUUID(),
        date: date.toISOString(),
        dueDate: dueDate.toISOString(),
        isInstallment: installmentsCount > 1,
        installmentNumber: installmentsCount > 1 ? i + 1 : undefined,
        totalInstallments: installmentsCount > 1 ? installmentsCount : undefined,
        groupId: installmentsCount > 1 ? groupId : undefined
      });
    }
    const updatedTrans = [...transactions, ...newTransactions];
    setTransactions(updatedTrans);
    setAccounts(recalculateBalances(accounts, updatedTrans));
    saveAll(accounts, cards, updatedTrans);
  };

  const updateTransaction = (transaction: Transaction) => {
    const updated = transactions.map(t => t.id === transaction.id ? transaction : t);
    setTransactions(updated);
    setAccounts(recalculateBalances(accounts, updated));
    saveAll(accounts, cards, updated);
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    setAccounts(recalculateBalances(accounts, updated));
    saveAll(accounts, cards, updated);
  };

  const toggleTransactionStatus = (id: string) => {
    const updated = transactions.map(t => {
      if (t.id === id) {
        const newStatus = t.status === TransactionStatus.PAID ? TransactionStatus.OPEN : TransactionStatus.PAID;
        return { ...t, status: newStatus };
      }
      return t;
    });
    setTransactions(updated);
    setAccounts(recalculateBalances(accounts, updated));
    saveAll(accounts, cards, updated);
  };

  const canAccessHistory = useCallback((date: Date) => {
    if (isPro) return true;
    const now = new Date();
    const isCurrentMonth = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    if (isCurrentMonth) return true;

    // Checagem de mês anterior com carência de 5 dias
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const diffDays = Math.floor((now.getTime() - firstDayCurrentMonth.getTime()) / (1000 * 60 * 60 * 24));
    
    const isPreviousMonth = date.getMonth() === (now.getMonth() === 0 ? 11 : now.getMonth() - 1) && 
                          (now.getMonth() === 0 ? date.getFullYear() === now.getFullYear() - 1 : date.getFullYear() === now.getFullYear());

    if (isPreviousMonth && diffDays <= 5) return true;

    return false;
  }, [isPro]);

  return (
    <FinanceContext.Provider value={{
      accounts, cards, transactions, 
      addAccount, updateAccount, deleteAccount,
      addCard, updateCard, deleteCard,
      addTransaction, updateTransaction, deleteTransaction, toggleTransactionStatus,
      isPro, canAccessHistory
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};

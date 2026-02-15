
import { Account, CreditCard, Transaction, UserConfig, User } from '../types';

const KEYS = {
  ACCOUNTS: 'fl_accounts',
  CARDS: 'fl_cards',
  TRANSACTIONS: 'fl_transactions',
  CONFIG: 'fl_config',
  AUTH: 'fl_auth'
};

export const storageService = {
  getAccounts: (): Account[] => {
    const data = localStorage.getItem(KEYS.ACCOUNTS);
    return data ? JSON.parse(data) : [];
  },
  saveAccounts: (accounts: Account[]) => {
    localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
  },

  getCards: (): CreditCard[] => {
    const data = localStorage.getItem(KEYS.CARDS);
    return data ? JSON.parse(data) : [];
  },
  saveCards: (cards: CreditCard[]) => {
    localStorage.setItem(KEYS.CARDS, JSON.stringify(cards));
  },

  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },
  saveTransactions: (transactions: Transaction[]) => {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  getConfig: (): UserConfig => {
    const data = localStorage.getItem(KEYS.CONFIG);
    return data ? JSON.parse(data) : { isPro: false, theme: 'light' };
  },
  saveConfig: (config: UserConfig) => {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  },

  getAuth: (): User | null => {
    const data = localStorage.getItem(KEYS.AUTH);
    return data ? JSON.parse(data) : null;
  },
  saveAuth: (user: User | null) => {
    if (user) {
      localStorage.setItem(KEYS.AUTH, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.AUTH);
    }
  }
};

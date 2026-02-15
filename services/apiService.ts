
import { User, Transaction, Account, CreditCard } from '../types';

// Simulando um cliente de API que se conectaria a um backend Node/Neon
const NEON_API_URL = process.env.NEON_DATABASE_URL || 'https://api.neon-db.simulation.com';

export const apiService = {
  // Usuário
  syncUser: async (user: Partial<User>): Promise<User> => {
    console.log('NeonDB: Sincronizando usuário...', user.email);
    // Simulação de persistência no Neon
    return {
      ...user,
      id: user.id || 'usr_' + Math.random().toString(36).substr(2, 9),
      isPro: user.isPro || false,
      subscriptionActive: user.isPro || false,
      createdAt: new Date().toISOString()
    } as User;
  },

  // Dados Financeiros
  fetchData: async (userId: string) => {
    console.log('NeonDB: Buscando dados para', userId);
    // Em produção: SELECT * FROM transactions WHERE user_id = userId
    return {
      accounts: JSON.parse(localStorage.getItem('fl_accounts') || '[]'),
      cards: JSON.parse(localStorage.getItem('fl_cards') || '[]'),
      transactions: JSON.parse(localStorage.getItem('fl_transactions') || '[]')
    };
  },

  updateProStatus: async (userId: string, isPro: boolean) => {
    console.log('NeonDB: Atualizando status PRO para', userId);
    // Em produção: UPDATE users SET is_pro = true WHERE id = userId
  }
};
